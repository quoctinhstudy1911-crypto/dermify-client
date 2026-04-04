import axiosClient from "./axiosClient";

const productApi = {
  // Lấy danh sách sản phẩm với phân trang, lọc theo danh mục, giá, thương hiệu, tìm kiếm
  getProducts: (params) => {
    return axiosClient.get("/products", { params });
  },

  // Lấy chi tiết sản phẩm theo slug (dùng cho trang chi tiết sản phẩm)
  getProductDetail: (slug) => {
    return axiosClient.get(`/products/${slug}`);
  },

  // Tạo sản phẩm mới (Dành cho Admin)
  createProduct: (data) => {
    return axiosClient.post("/products", data);
  },

  // Cập nhật sản phẩm (Dành cho Admin)
  updateProduct: (id, data) => {
    return axiosClient.put(`/products/${id}`, data);
  },

  // Xóa sản phẩm (Dành cho Admin)
  deleteProduct: (id) => {
    return axiosClient.delete(`/products/${id}`);
  },
};

export default productApi;