import axiosClient from "./axiosClient";

const productApi = {
  /**
   * Lấy danh sách sản phẩm (có phân trang, lọc, tìm kiếm)
   * @param {Object} params { page, limit, search, categoryId, minPrice, maxPrice, sort }
   */
  getProducts: (params) => {
    return axiosClient.get("/products", { params });
  },

  /**
   * Xem chi tiết sản phẩm qua Slug (Dành cho trang chi tiết sản phẩm)
   * @param {String} slug 
   */
  getProductDetail: (slug) => {
    return axiosClient.get(`/products/${slug}`);
  },

  /**
   * Thêm sản phẩm mới (Dành cho Admin)
   * @param {Object} data 
   */
  createProduct: (data) => {
    return axiosClient.post("/products", data);
  },

  /**
   * Cập nhật thông tin sản phẩm (Dành cho Admin)
   * @param {String} id 
   * @param {Object} data 
   */
  updateProduct: (id, data) => {
    return axiosClient.put(`/products/${id}`, data);
  },

  /**
   * Xóa sản phẩm - Soft Delete (Dành cho Admin)
   * @param {String} id 
   */
  deleteProduct: (id) => {
    return axiosClient.delete(`/products/${id}`);
  },
};

export default productApi;