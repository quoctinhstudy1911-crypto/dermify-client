import axiosClient from "./axiosClient";

const productApi = {
  // Nhận tất cả sản phẩm với các tham số tùy chọn (ví dụ: phân trang, lọc, sắp xếp)
  getProducts: async (params) => {
    const res = await axiosClient.get("/products", { params });
    return res.data;
  },
  // Nhận chi tiết sản phẩm theo slug
  getProductDetail: async (slug) => {
    const res = await axiosClient.get(`/products/${slug}`);
    return res.data;
  },
  // Tạo sản phẩm mới
  createProduct: async (data) => {
    const res = await axiosClient.post("/products", data);
    return res.data;
  },
  // Cập nhật sản phẩm theo ID
  updateProduct: async (id, data) => {
    const res = await axiosClient.put(`/products/${id}`, data);
    return res.data;
  },
  // Xóa sản phẩm theo ID
  deleteProduct: async (id) => {
    const res = await axiosClient.delete(`/products/${id}`);
    return res.data;
  },
};

export default productApi;