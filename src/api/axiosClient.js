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
    const isAdminPage = window.location.pathname.startsWith("/admin");
    const token = isAdminPage 
      ? localStorage.getItem("admin_accessToken") 
      : localStorage.getItem("accessToken");

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
    // LỚP 1 & 2: Bóc tách theo logic gốc của bạn
    const res = response.data; 
    if (res && res.data !== undefined) {
      return res.data; 
    }
    return res;
  },
  async (error) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;
    const originalRequest = error.config;

    const isAdminPage = currentPath.startsWith("/admin");
    const isLoginPage = currentPath.includes("/login") || currentPath.includes("/dangnhap");

    // Kiểm tra token hiện tại để xác định có cần refresh hay không
    const hasToken = isAdminPage 
      ? localStorage.getItem("admin_accessToken") 
      : localStorage.getItem("accessToken");

    // CHỈ XỬ LÝ REFRESH TOKEN KHI: Lỗi 401, không phải trang login, và đang có token cũ
    if (status === 401 && hasToken && !isLoginPage && !originalRequest._retry) {
      
      const refreshToken = isAdminPage
        ? localStorage.getItem("admin_refreshToken")
        : localStorage.getItem("refreshToken");

      // Nếu không có refresh token để "cứu" -> Logout luôn
      if (!refreshToken) {
        window.location.href = isAdminPage ? "/admin/login" : "/dangnhap";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Nếu đang có 1 request refresh đang chạy, đẩy các request sau vào hàng chờ
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Đánh dấu đã thử lại để tránh loop vô tận
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API lấy token mới (Sử dụng axios gốc để tránh interceptor này)
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, { 
          refreshToken 
        });
        
        // Giả định backend trả về token trong res.data.data.accessToken
        const newToken = res.data?.data?.accessToken || res.data?.accessToken;

        // Lưu token mới vào đúng vị trí
        if (isAdminPage) {
          localStorage.setItem("admin_accessToken", newToken);
        } else {
          localStorage.setItem("accessToken", newToken);
        }

        // Thực thi các request đang đợi trong queue
        processQueue(null, newToken);

        // Chạy lại request bị lỗi vừa rồi với token mới
        originalRequest.headers.Authorization = "Bearer " + newToken;
        return axiosClient(originalRequest);

      } catch (err) {
        // Nếu Refresh thất bại (Refresh Token hết hạn)
        processQueue(err, null);
        
        // Xóa sạch bộ nhớ theo phân quyền
        if (isAdminPage) {
          localStorage.removeItem("admin_accessToken");
          localStorage.removeItem("admin_refreshToken");
          localStorage.removeItem("admin_role");
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

    // Các lỗi khác không phải 401 hoặc lỗi nghiêm trọng
    return Promise.reject({
      message: error.response?.data?.message || "Có lỗi xảy ra",
      status,
    });
  }
);

export default axiosClient;