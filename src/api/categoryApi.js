import axiosClient from "./axiosClient";

const categoryApi = {
  
  // LẤY CÂY DANH MỤC
  getCategoryTree: () => {
    return axiosClient.get("/categories");
  },

  // LẤY DANH MỤC THEO SLUG (DÙNG CHO TRANG DANH MỤC SẢN PHẨM)
  getCategoryBySlug: (slug) => {
    return axiosClient.get(`/categories/${slug}`);
  },

  // TẠO DANH MỤC MỚI (Admin)
  createCategory: (data) => {
    return axiosClient.post("/categories", data);
  },

  // CẬP NHẬT DANH MỤC (Admin)
  updateCategory: (id, data) => {
    return axiosClient.put(`/categories/${id}`, data);
  },

  // XÓA DANH MỤC (Admin) (lưu ý: nếu danh mục có con thì sẽ không xóa được)
  deleteCategory: (id) => {
    return axiosClient.delete(`/categories/${id}`);
  },
};

export default categoryApi;
