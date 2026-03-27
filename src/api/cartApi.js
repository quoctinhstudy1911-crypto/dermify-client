import axiosClient from "./axiosClient";

const cartApi = {
  // Thêm sản phẩm vào giỏ hàng
  addToCart: (data) => axiosClient.post("/cart/add", data),
};

export default cartApi;