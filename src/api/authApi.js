import axiosClient from "./axiosClient";

const authApi = {
  // Đăng nhập
  login: (data) => axiosClient.post("/auth/login", data),

  // Đăng ký
  register: (data) => axiosClient.post("/auth/register", data),
};

export default authApi;