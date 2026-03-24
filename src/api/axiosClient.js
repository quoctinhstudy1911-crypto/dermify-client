import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://dermify-api.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

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
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
      window.location.href = "/dangnhap";
    }

    if (status === 403) {
      alert("Bạn không có quyền truy cập!");
    }

    return Promise.reject(error);
  }
);

export default axiosClient;