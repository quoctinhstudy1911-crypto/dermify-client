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
  
// Trong file axiosClient.js - phần xử lý lỗi (error)
(error) => {
  const status = error.response?.status;
  const currentPath = window.location.pathname;
  
  // Lấy token hiện tại để kiểm tra
  const isAdminPage = currentPath.startsWith("/admin");
  const hasToken = isAdminPage 
    ? localStorage.getItem("admin_accessToken") 
    : localStorage.getItem("accessToken");

  const isLoginPage = currentPath.includes("/login") || currentPath.includes("/dangnhap");

  // CHỈ HIỆN ALERT KHI: Bị lỗi 401 VÀ Trong máy thực sự đang có Token (Token hết hạn)
  if (status === 401 && hasToken && !isRedirecting && !isLoginPage) {
    isRedirecting = true;
    
    // Xóa token lỗi
    if (isAdminPage) {
      localStorage.removeItem("admin_accessToken");
      localStorage.removeItem("admin_refreshToken");
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }

    alert("Phiên đăng nhập hết hạn!");
    window.location.href = isAdminPage ? "/admin/login" : "/dangnhap";
  }

  return Promise.reject({
    message: error.response?.data?.message || "Có lỗi xảy ra",
    status,
  });
}
);

export default axiosClient;