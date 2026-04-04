import axiosClient from "./axiosClient";

const authApi = {

  //AUTHENTICATION
  login: (data) => axiosClient.post("/auth/login", data),

  register: (data) => axiosClient.post("/auth/register", data),

  logout: () => axiosClient.post("/auth/logout"),

  getMe: () => axiosClient.get("/auth/me"),

  // XÁC NHẬN EMAIL
  verifyEmail: (token) =>
    axiosClient.get(`/auth/verify-email?token=${token}`),

  // QUÊN MẬT KHẨU
  forgotPassword: (email) =>
    axiosClient.post("/auth/forgot-password", { email }),

  resetPassword: (data) => axiosClient.post("/auth/reset-password", data),

  // LÀM MỚI TOKEN
  refreshToken: (refreshToken) =>
    axiosClient.post("/auth/refresh-token", { refreshToken }),
};

export default authApi;
