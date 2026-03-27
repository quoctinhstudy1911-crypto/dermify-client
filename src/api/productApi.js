import axiosClient from "./axiosClient";

const productApi = {
  // Lấy danh sách sản phẩm (có thể truyền params)
  getProducts: (params) =>
    axiosClient.get("/products", { params }),

  // Lấy chi tiết sản phẩm theo slug
  getProductDetail: (slug) =>
    axiosClient.get(`/products/${slug}`),

  // Tạo sản phẩm mới
  createProduct: (data) =>
    axiosClient.post("/products", data),

  // Cập nhật sản phẩm theo ID
  updateProduct: (id, data) =>
    axiosClient.put(`/products/${id}`, data),

  // Xóa sản phẩm theo ID
  deleteProduct: (id) =>
    axiosClient.delete(`/products/${id}`),
};

export default productApi;