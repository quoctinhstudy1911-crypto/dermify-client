import axios from "axios";

/**
 * Tạo instance axios dùng chung cho toàn project
 * - baseURL lấy từ file .env
 * - giúp không phải viết lại URL nhiều lần
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

/**
 * REQUEST INTERCEPTOR
 * Chạy TRƯỚC khi gửi request lên server
 * Dùng để:
 *    - Gắn token vào header
 */
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem("token");

    // Nếu có token → gắn vào header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Nếu có lỗi khi tạo request → trả về lỗi
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 * Chạy SAU khi nhận response từ server
 * Dùng để:
 *    - Xử lý lỗi chung (401, 403,...)
 *    - Trả về data gọn hơn
 */
axiosClient.interceptors.response.use(
  (response) => {
    // Trả về luôn data
    return response.data;
  },
  (error) => {
    const status = error.response?.status;

    /**
     * 401 - Token hết hạn / chưa đăng nhập
     * Logout + chuyển về trang login
     */
    if (status === 401) {
      localStorage.removeItem("token");
      alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
      window.location.href = "/dangnhap";
    }

    /**
     * 403 - Không có quyền truy cập
     */
    if (status === 403) {
      alert("Bạn không có quyền truy cập!");
    }

    /**
     * Chuẩn hóa lỗi trả về
     */
    return Promise.reject({
      message: error.response?.data?.message || "Có lỗi xảy ra",
      status: status,
    });
  }
);

export default axiosClient;