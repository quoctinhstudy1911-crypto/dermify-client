import axiosClient from "./axiosClient";

const userAPI = {
  login: (data) => axiosClient.post("/auth/login", data),
  register: (data) => axiosClient.post("/auth/register", data),

  getProfile: () => axiosClient.get("/customer/profile"),
  updateProfile: (data) => axiosClient.put("/customer/profile", data),

  getAddresses: () => axiosClient.get("/customer/address"),
  addAddress: (data) => axiosClient.post("/customer/address", data),
  updateAddress: (id, data) => axiosClient.put(`/customer/address/${id}`, data),
  deleteAddress: (id) => axiosClient.delete(`/customer/address/${id}`),
  setDefaultAddress: (id) => axiosClient.put(`/customer/address/${id}/default`),

  uploadAvatar: (formData) => {
    return axiosClient.post("/customer/upload-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
export default userAPI;
