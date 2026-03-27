import axiosClient from "./axiosClient";

const staffApi = {
  // Tạo nhân viên mới
  createStaff: async (data) => {
    const res = await axiosClient.post("/staff", data);
    return res.data;
  },
  // Lấy tất cả nhân viên
  getAllStaff: async () => {
    const res = await axiosClient.get("/staff");
    return res.data;
  },
  // Lấy thông tin nhân viên theo ID
  getStaffById: async (id) => {
    const res = await axiosClient.get(`/staff/${id}`);
    return res.data;
  },
  // Cập nhật thông tin nhân viên theo ID
  updateStaff: async (id, data) => {
    const res = await axiosClient.put(`/staff/${id}`, data);
    return res.data;
  },
  // Xóa nhân viên theo ID
  deleteStaff: async (id) => {
    const res = await axiosClient.delete(`/staff/${id}`);
    return res.data;
  },
  // Tạo tài khoản admin mới
  createAdmin: async (data) => {
    const res = await axiosClient.post("/staff/create-admin", data);
    return res.data;
  },
};

export default staffApi;