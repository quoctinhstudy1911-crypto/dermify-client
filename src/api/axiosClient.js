import axios from "axios";

/**
 * Axios Client dùng chung cho toàn project
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000, // tránh treo request
});

/**
 * REQUEST INTERCEPTOR
 * - Gắn token vào header
 */
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 * - Trả về data gọn
 * - Xử lý lỗi chung
 */
axiosClient.interceptors.response.use(
  (response) => {
    /**
     * Chuẩn hóa data:
     * - Nếu backend có { data: ... } → lấy data
     * - Nếu không → trả luôn response.data
     */
    return response.data?.data ?? response.data;
  },
  (error) => {
    const status = error.response?.status;

    /**
     * 401 - Hết hạn token
     */
    if (status === 401) {
      localStorage.removeItem("token");
      alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
      window.location.href = "/dangnhap";
    }

    /**
     * 403 - Không có quyền
     */
    if (status === 403) {
      alert("Bạn không có quyền truy cập!");
    }

    /**
     * Chuẩn hóa lỗi trả về
     */
    return Promise.reject({
      message: error.response?.data?.message || "Có lỗi xảy ra",
      status,
    });
  }
);

export default axiosClient;