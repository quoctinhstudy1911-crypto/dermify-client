import axiosClient from "./axiosClient";

const userApi = {
  // Lấy thông tin hồ sơ người dùng
  getProfile: () =>
    axiosClient.get("/customer/profile"),

  // Cập nhật thông tin hồ sơ người dùng
  updateProfile: (data) =>
    axiosClient.put("/customer/profile", data),

  // Lấy danh sách địa chỉ
  getAddresses: () =>
    axiosClient.get("/customer/addresses"),

  // Thêm địa chỉ
  addAddress: (data) =>
    axiosClient.post("/customer/address", data),

  // Cập nhật địa chỉ
  updateAddress: (id, data) =>
    axiosClient.put(`/customer/address/${id}`, data),

  // Xóa địa chỉ
  deleteAddress: (id) =>
    axiosClient.delete(`/customer/address/${id}`),

  // Đặt địa chỉ mặc định
  setDefaultAddress: (id) =>
    axiosClient.put(`/customer/address/${id}/default`),

  // Upload avatar
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return axiosClient.post("/customer/upload-avatar", formData, {
      timeout: 60000, // tăng timeout cho việc upload ảnh lớn
    });
  },
};

const adminUserApi = {
  getAllUsers: (params) => axiosClient.get("/users", { params }),
  createUser: (data) => axiosClient.post("/users", data),
  updateUserStatus: (id, data) => axiosClient.put(`/users/${id}`, data),
  deleteUser: (id) => axiosClient.delete(`/users/${id}`),
};

userApi.admin = adminUserApi;

export default userApi;
