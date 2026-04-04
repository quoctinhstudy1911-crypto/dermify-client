import axiosClient from "./axiosClient";

const reviewApi = {
  // Tạo đánh giá mới cho sản phẩm (Cần Token)
  createReview: (data) => {
    return axiosClient.post("/reviews", data);
  },

  // Lấy danh sách đánh giá của một sản phẩm với phân trang
  getProductReviews: (productId, params) => {
    return axiosClient.get(`/reviews/${productId}`, { params });
  },

  // Cập nhật đánh giá (Cần Token - Chỉ chính chủ)
  updateReview: (reviewId, data) => {
    return axiosClient.put(`/reviews/${reviewId}`, data);
  },

  // Xóa bài đánh giá (Cần Token - Chỉ chính chủ)
  deleteReview: (reviewId) => {
    return axiosClient.delete(`/reviews/${reviewId}`);
  },
};

export default reviewApi;