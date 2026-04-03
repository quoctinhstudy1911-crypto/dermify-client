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
// RESPONSE trong axiosClient.js
axiosClient.interceptors.response.use(
  (response) => {
    return response.data?.data ?? response.data;
  },
  (error) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;

    if (status === 401) {
      // 1. Xóa token cũ
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // 2. CHỈ HIỆN ALERT VÀ CHUYỂN TRANG NẾU:
      // - Không phải đang ở trang đăng nhập/đăng ký
      // - Và không phải đang ở trang chủ (vì khách vãng lai vẫn xem được trang chủ)
      const publicPages = ["/dangnhap", "/dangki", "/"];
      if (!publicPages.includes(currentPath)) {
        alert("Phiên đăng nhập hết hạn!");
        window.location.href = "/dangnhap";
      }
    }

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