import axiosClient from "./axiosClient";

const uploadApi = {
  // Nhận vào 1 file duy nhất
  uploadImages: (file) => {
    const formData = new FormData();
    
    // Phải là "images" vì Backend đang đợi key này
    formData.append("images", file); 

    return axiosClient.post("/upload/images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default uploadApi;