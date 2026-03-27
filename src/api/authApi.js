import axiosClient from "./axiosClient";

const authApi = {
  // Đăng nhập
  login: async (data) => {
    const res = await axiosClient.post("/auth/login", data);
    return res.data;
  },

  // Đăng ký
  register: async (data) => {
    const res = await axiosClient.post("/auth/register", data);
    return res.data;
  },
};

export default authApi;