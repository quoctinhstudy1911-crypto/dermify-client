import axiosClient from "./axiosClient";

const reviewApi = {
  /**
   * Tạo đánh giá mới (Cần Token)
   * @param {Object} data { productId, rating, comment, images }
   */
  createReview: (data) => {
    return axiosClient.post("/review", data);
  },

  /**
   * Lấy danh sách đánh giá của 1 sản phẩm (Công khai - Public)
   * @param {String} productId 
   * @param {Object} params { page, limit }
   */
  getProductReviews: (productId, params) => {
    return axiosClient.get(`/review/${productId}`, { params });
  },

  /**
   * Cập nhật bài đánh giá (Cần Token - Chỉ chính chủ)
   * @param {String} reviewId 
   * @param {Object} data { rating, comment, images }
   */
  updateReview: (reviewId, data) => {
    return axiosClient.put(`/review/${reviewId}`, data);
  },

  /**
   * Xóa bài đánh giá (Cần Token - Chính chủ hoặc Admin)
   * @param {String} reviewId 
   */
  deleteReview: (reviewId) => {
    return axiosClient.delete(`/review/${reviewId}`);
  },
};

export default reviewApi;