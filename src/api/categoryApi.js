import axiosClient from "./axiosClient";

const categoryApi = {
  // Lấy danh sách tất cả danh mục
  getCategories: () => axiosClient.get("/categories"),

  // Lấy chi tiết danh mục theo slug
  getCategoryDetail: (slug) =>
    axiosClient.get(`/categories/${slug}`),

  // Tạo mới danh mục
  createCategory: (data) =>
    axiosClient.post("/categories", data),

  // Cập nhật danh mục
  updateCategory: (id, data) =>
    axiosClient.put(`/categories/${id}`, data),

  // Xóa danh mục
  deleteCategory: (id) =>
    axiosClient.delete(`/categories/${id}`),
};

export default categoryApi;