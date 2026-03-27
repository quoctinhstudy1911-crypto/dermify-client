import axiosClient from "./axiosClient";

const categoryApi = {
  // Lấy danh sách tất cả danh mục
  getCategories: async () => {
    const res = await axiosClient.get("/categories");
    return res.data;
  },
  // Lấy chi tiết danh mục theo slug
  getCategoryDetail: async (slug) => {
    const res = await axiosClient.get(`/categories/${slug}`);
    return res.data;
  },
  // Tạo mới danh mục
  createCategory: async (data) => {
    const res = await axiosClient.post("/categories", data);
    return res.data;
  },
  // Cập nhật danh mục
  updateCategory: async (id, data) => {
    const res = await axiosClient.put(`/categories/${id}`, data);
    return res.data;
  },
  //
  deleteCategory: async (id) => {
    const res = await axiosClient.delete(`/categories/${id}`);
    return res.data;
  },
};

export default categoryApi;