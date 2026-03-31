import axiosClient from "./axiosClient";

const categoryApi = {
  /**
   * Lấy toàn bộ danh mục dưới dạng cấu trúc Cây (Tree)
   * Dùng để đổ vào Menu hoặc Sidebar lọc sản phẩm
   */
  getCategoryTree: () => {
    return axiosClient.get("/category/tree");
  },

  /**
   * Lấy chi tiết 1 danh mục theo Slug
   */
  getCategoryBySlug: (slug) => {
    return axiosClient.get(`/category/${slug}`);
  },

  /**
   * Thêm mới danh mục (Admin)
   * @param {Object} data { name, parentId, status }
   */
  createCategory: (data) => {
    return axiosClient.post("/category", data);
  },

  /**
   * Cập nhật danh mục (Admin)
   */
  updateCategory: (id, data) => {
    return axiosClient.put(`/category/${id}`, data);
  },

  /**
   * Xóa danh mục
   * Lưu ý: Backend có check HAS_CHILDREN và HAS_PRODUCTS
   */
  deleteCategory: (id) => {
    return axiosClient.delete(`/category/${id}`);
  },
};

export default categoryApi;