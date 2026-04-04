import { Route, Navigate } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import Tc from "../pages/user/Trangchu";
import Dangki from "../pages/user/Dangki";
import Dangnhap from "../pages/user/Dangnhap";
import Profile from "../pages/user/Profile";
import VerifyEmail from "../pages/user/VerifyEmail";
import ForgotPassword from "../pages/user/ForgotPassword";
import ResetPassword from "../pages/user/ResetPassword";
import { useAuthContext } from "@/context/AuthContext";
const TempOrders = () => <div className="p-5">Trang Đơn hàng đang phát triển...</div>;

// Component bảo vệ route dành cho user
const RequireUser = ({ children }) => {
  const { user, loading } = useAuthContext();

  // ĐANG LOAD THÌ ĐỨNG YÊN, ĐỪNG CHUYỂN TRANG
  if (loading) {
    return <div className="text-center mt-5">Đang xác thực...</div>;
  }

  if (!user) {
    return <Navigate to="/dangnhap" />;
  }

  // Kiểm tra role cẩn thận (tránh lỗi chữ hoa/thường)
  if (user.role?.toLowerCase() !== "customer") {
    return <Navigate to="/" />;
  }

  return children;
};

export default function UserRoutes() {
  return (
    <>
      {/* PUBLIC */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<Tc />} />
      </Route>

      <Route path="/dangki" element={<Dangki />} />
      <Route path="/dangnhap" element={<Dangnhap />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* PRIVATE */}
      <Route
        element={
          <RequireUser>
            <UserLayout />
          </RequireUser>
        }
      >
        <Route path="/orders" element={<TempOrders />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </>
  );
}