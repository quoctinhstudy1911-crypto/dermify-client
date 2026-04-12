import axiosClient from "./axiosClient";

const staffApi = {
  // Tạo nhân viên mới
  createStaff: (data) =>
    axiosClient.post("/staff", data),

  // Lấy tất cả nhân viên
  getAllStaff: () =>
    axiosClient.get("/staff"),

  // Lấy thông tin nhân viên theo ID
  getStaffById: (id) =>
    axiosClient.get(`/staff/${id}`),

  // Cập nhật thông tin nhân viên theo ID
  updateStaff: (id, data) =>
    axiosClient.put(`/staff/${id}`, data),

  // Xóa nhân viên theo ID
  deleteStaff: (id) =>
    axiosClient.delete(`/staff/${id}`),

  // Tạo tài khoản admin mới
  createAdmin: (data) =>
    axiosClient.post("/staff/create-admin", data),
  
  // Lấy thông tin nhân viên của chính mình
  getMe: () => axiosClient.get("/staff/me"),

  // Cập nhật thông tin nhân viên của chính mình
  updateMe: (data) => axiosClient.put("/staff/me", data)
};

export default staffApi;