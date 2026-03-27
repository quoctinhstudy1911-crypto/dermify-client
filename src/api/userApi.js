import axiosClient from "./axiosClient";

const userApi = {
  // Lấy thông tin hồ sơ người dùng
  getProfile: async () => {
    const res = await axiosClient.get("/customer/profile");
    return res.data;
  },
  // Cập nhật thông tin hồ sơ người dùng
  updateProfile: async (data) => {
    const res = await axiosClient.put("/customer/profile", data);
    return res.data;
  },
  // Lấy danh sách địa chỉ của người dùng
  getAddresses: async () => {
    const res = await axiosClient.get("/customer/addresses");
    return res.data;
  },
  // Thêm địa chỉ mới cho người dùng
  addAddress: async (data) => {
    const res = await axiosClient.post("/customer/address", data);
    return res.data;
  },
  // Cập nhật địa chỉ của người dùng theo ID
  updateAddress: async (id, data) => {
    const res = await axiosClient.put(`/customer/address/${id}`, data);
    return res.data;
  },
  // Xóa địa chỉ của người dùng theo ID
  deleteAddress: async (id) => {
    const res = await axiosClient.delete(`/customer/address/${id}`);
    return res.data;
  },
  // Đặt địa chỉ mặc định cho người dùng theo ID
  setDefaultAddress: async (id) => {
    const res = await axiosClient.put(`/customer/address/${id}/default`);
    return res.data;
  },
  // Tải lên ảnh đại diện cho người dùng
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    const res = await axiosClient.post("/customer/upload-avatar", formData);
    return res.data;
  },
};
export default userApi;
