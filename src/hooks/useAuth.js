import { useEffect, useState } from "react";
import { authApi } from "@/api";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      // BƯỚC 1: Kiểm tra xem trong máy có Token không
      const token = localStorage.getItem("accessToken");

      // BƯỚC 2: Nếu KHÔNG CÓ token -> Ngừng luôn, không gọi API
      if (!token) {
        setUser(null);
        setLoading(false);
        return; 
      }

      // BƯỚC 3: Nếu CÓ token mới gọi lên Server để lấy thông tin
      try {
        const data = await authApi.getMe();
        setUser(data);
      } catch (err) {
        // Nếu Token trong máy bị sai hoặc hết hạn thật sự (lỗi 401)
        // thì xóa nó đi để lần sau vào web không bị gọi nhầm nữa
        if (err.response?.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []); // Chạy 1 lần duy nhất khi load trang

  return { user, loading };
};