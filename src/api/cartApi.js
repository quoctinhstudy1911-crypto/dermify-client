import axiosClient from "./axiosClient";

const cartApi = {
  // Thêm sản phẩm vào giỏ hàng
   addToCart: async (data) => {
    const res = await axiosClient.post("/cart/add", data);
    return res.data;
  },
};

export default cartApi;