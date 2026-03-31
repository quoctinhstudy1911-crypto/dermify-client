import axiosClient from "./axiosClient";

const cartApi = {
  // Lấy giỏ hàng của người dùng hiện tại
  getCart: () => axiosClient.get("/cart"),

  // Thêm sản phẩm (Truyền body: { productId, quantity })
  addToCart: (data) => axiosClient.post("/cart/add", data),

  // Cập nhật số lượng (Truyền body: { productId, quantity })
  updateCartItem: (data) => axiosClient.put("/cart/update", data),

  // Xóa 1 sản phẩm (Truyền params trên URL)
  removeCartItem: (productId) => axiosClient.delete(`/cart/remove/${productId}`),

  // Xóa sạch giỏ hàng
  clearCart: () => axiosClient.delete("/cart/clear"),
};

export default cartApi;