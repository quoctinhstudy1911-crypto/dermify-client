import { Route, Navigate } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import Tc from "../pages/user/Trangchu";
import Dangki from "../pages/user/Dangki";
import Dangnhap from "../pages/user/Dangnhap";
import Profile from "../pages/user/Profile";
import VerifyEmail from "../pages/user/VerifyEmail";
import ForgotPassword from "../pages/user/ForgotPassword";
import ResetPassword from "../pages/user/ResetPassword";

// Component bảo vệ route dành cho user
import { useAuthContext } from "@/context/AuthContext";

const RequireUser = ({ children }) => {
  const { user, loading } = useAuthContext();

  // Nếu đang load (kiểm tra token, lấy thông tin user...) thì không render gì cả (hoặc có thể render spinner)
  if (loading) return null;

  // Nếu không có user nào (chưa đăng nhập) thì chuyển về trang đăng nhập
  if (!user) {
    return <Navigate to="/dangnhap" />;
  }

  // Nếu user có role khác "customer" (ví dụ admin) thì chuyển về trang admin
  if (user.role !== "customer") {
    return <Navigate to="/admin" />;
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
        <Route path="/profile" element={<Profile />} />
      </Route>
    </>
  );
}