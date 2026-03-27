import axiosClient from "./axiosClient";

const uploadApi = {
  // Tải lên nhiều hình ảnh cùng lúc
  uploadImages: async (files) => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("images", file);
    });

    const res = await axiosClient.post("/upload/images", formData);
    return res.data;
  },
};

export default uploadApi;