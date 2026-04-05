import axios from "axios";

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

let isRedirecting = false;

// ======================
// 2. RESPONSE INTERCEPTOR (BÓC 2 LỚP)
// ======================
axiosClient.interceptors.response.use(
  (response) => {
    // LỚP 1: axios trả về (response.data)
    const res = response.data; 

    // LỚP 2: Backend của bạn bọc trong key 'data'
    // Ví dụ: { success: true, data: { ... }, message: "" }
    if (res && res.data !== undefined) {
      // Trả về dữ liệu bên trong cùng
      return res.data; 
    }
    
    // Nếu không có lớp 'data', trả về nguyên bản (phòng hờ API khác)
    return res;
  },
  
  (error) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;
    
    // Kiểm tra xem có phải đang ở trang login không
    const isLoginPage = currentPath.includes("/login") || currentPath.includes("/dangnhap");

    // Nếu lỗi 401 (Hết hạn) và KHÔNG phải đang ở trang login thì mới đá ra ngoài
    if (status === 401 && !isRedirecting && !isLoginPage) {
      isRedirecting = true;
      
      const isAdminPage = currentPath.startsWith("/admin");
      if (isAdminPage) {
        localStorage.removeItem("admin_accessToken");
        localStorage.removeItem("admin_refreshToken");
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }

      alert("Phiên đăng nhập hết hạn!");
      window.location.href = isAdminPage ? "/admin/login" : "/dangnhap";
    }

    // Trả về error object chuẩn để dùng ở catch(err)
    return Promise.reject({
      message: error.response?.data?.message || "Có lỗi xảy ra",
      status,
    });
  }
);

export default axiosClient;