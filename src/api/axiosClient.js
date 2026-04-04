import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// REQUEST
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Biến cờ để tránh redirect nhiều lần khi token hết hạn
let isRedirecting = false;
// RESPONSE trong axiosClient.js
axiosClient.interceptors.response.use(
  (response) => {
    const res = response.data;
    console.log("FULL RESPONSE:", response.data);

   // Case 1: chuẩn backend (có data)
    if (res && typeof res.data !== "undefined") {
      return res.data;
    }
    
    // Case 2: chuẩn cũ (không có data, trả về trực tiếp)
    return res;
  },
  
  // Xử lý lỗi toàn cục
  (error) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;

    // 401 Unauthorized - Token hết hạn hoặc không hợp lệ
    if (status === 401 && !isRedirecting) {
      // Đặt cờ để tránh redirect nhiều lần
      isRedirecting = true;
      // 1. Xóa token cũ
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // 2. Nếu không phải đang ở trang đăng nhập/đăng ký hoặc trang chủ thì mới chuyển hướng về trang đăng nhập
      const publicPages = ["/dangnhap", "/dangki", "/"];
      const isPublic = publicPages.some((page) =>
        currentPath.startsWith(page)
      );
       if (!isPublic) {
        alert("Phiên đăng nhập hết hạn!");
        window.location.href = "/dangnhap";
      }
    }

    // 403 Forbidden - Người dùng không có quyền truy cập
    if (status === 403) {
      alert(error.response?.data?.message || "Bạn không có quyền thực hiện thao tác này!");
    }

    return Promise.reject({
      message: error.response?.data?.message || "Có lỗi xảy ra",
      status,
    });
  }
);

export default axiosClient;