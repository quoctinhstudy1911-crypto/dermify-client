import axiosClient from "./axiosClient";

const uploadApi = {
  // Tải lên nhiều hình ảnh
  uploadImages: (files) => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("images", file);
    });

    return axiosClient.post("/upload/images", formData);
  },
};

export default uploadApi;