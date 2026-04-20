import axiosClient from "./axiosClient";

const staffApi = {
  createStaff: (data) => axiosClient.post("/staff", data),

  getAllStaff: (params) => axiosClient.get("/staff", { params }),

  getStaffById: (id) => axiosClient.get(`/staff/${id}`),

  updateStaff: (id, data) => axiosClient.put(`/staff/${id}`, data),

  deleteStaff: (id) => axiosClient.delete(`/staff/${id}`),

  createAdmin: (data) => axiosClient.post("/staff/create-admin", data),

  getMe: () => axiosClient.get("/staff/me"),

  updateMe: (data) => axiosClient.put("/staff/me", data),
};

export default staffApi;
