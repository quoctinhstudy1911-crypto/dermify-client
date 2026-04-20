import axios from "axios";

// ======================
// BIẾN HỖ TRỢ REFRESH TOKEN
// ======================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// ======================
// 1. REQUEST INTERCEPTOR
// ======================
axiosClient.interceptors.request.use(
  (config) => {
    // Ưu tiên lấy adminToken nếu gọi API staff hoặc đang ở các route quản trị
    const adminToken = localStorage.getItem("admin_accessToken");
    const userToken = localStorage.getItem("accessToken");
    
    const isAdminPath = window.location.pathname.startsWith("/admin");
    const isStaffApi = config.url.includes("/staff");

    // Logic: Nếu gọi API liên quan nhân viên hoặc đang ở trang admin thì dùng adminToken
    const token = (isAdminPath || isStaffApi) ? adminToken : userToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ======================
// 2. RESPONSE INTERCEPTOR
// ======================
axiosClient.interceptors.response.use(
  (response) => {
    // Bóc tách dữ liệu theo chuẩn backend (data.data hoặc data)
    const res = response.data; 
    if (res && res.data !== undefined) {
      // BẢO TOÀN PAGINATION: Nếu Backend để pagination ở ngoài cùng, 
      // ta ghim thẳng nó vào data để Frontend gọi dễ dàng (vd: response.pagination)
      if (res.pagination) {
        res.data.pagination = res.pagination;
      }
      return res.data; 
    }
    return res;
  },
  async (error) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;
    const originalRequest = error.config;

    const isAdminPage = currentPath.startsWith("/admin");
    // Kiểm tra xem có đang ở trang login không để tránh loop refresh token
    const isLoginPage = currentPath.includes("/login") || currentPath.includes("/dangnhap");

    // Xác định đang dùng loại token nào để refresh cho đúng
    const hasToken = isAdminPage 
      ? localStorage.getItem("admin_accessToken") 
      : localStorage.getItem("accessToken");

    // XỬ LÝ REFRESH TOKEN (Khi gặp lỗi 401)
    if (status === 401 && hasToken && !isLoginPage && !originalRequest._retry) {
      
      const refreshToken = isAdminPage
        ? localStorage.getItem("admin_refreshToken")
        : localStorage.getItem("refreshToken");

      if (!refreshToken) {
        window.location.href = isAdminPage ? "/admin/login" : "/dangnhap";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API lấy token mới bằng axios gốc
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh-token`, { 
          refreshToken 
        });
        
        const newToken = res.data?.data?.accessToken || res.data?.accessToken;

        if (isAdminPage) {
          localStorage.setItem("admin_accessToken", newToken);
        } else {
          localStorage.setItem("accessToken", newToken);
        }

        processQueue(null, newToken);
        originalRequest.headers.Authorization = "Bearer " + newToken;
        return axiosClient(originalRequest);

      } catch (err) {
        processQueue(err, null);
        
        // Clear storage nếu refresh token cũng tèo
        if (isAdminPage) {
          localStorage.removeItem("admin_accessToken");
          localStorage.removeItem("admin_refreshToken");
          localStorage.removeItem("admin_role");
          localStorage.removeItem("admin_info");
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
        }
        
        alert("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
        window.location.href = isAdminPage ? "/admin/login" : "/dangnhap";
        return Promise.reject(err);

      } finally {
        isRefreshing = false;
      }
    }

    // Các lỗi khác trả về message từ backend hoặc mặc định
    return Promise.reject({
      message: error.response?.data?.message || "Có lỗi xảy ra",
      status,
      data: error.response?.data // Giữ lại data để check lỗi chi tiết (như lỗi 400 email tồn tại)
    });
  }
);

export default axiosClient;