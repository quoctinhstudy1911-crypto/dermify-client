import { Route, Navigate } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import Tc from "../pages/user/Trangchu";
import Dangki from "../pages/user/Dangki";
import Dangnhap from "../pages/user/Dangnhap";
import Profile from "../pages/user/Profile";
import VerifyEmail from "../pages/user/VerifyEmail";
import ForgotPassword from "../pages/user/ForgotPassword";
import ResetPassword from "../pages/user/ResetPassword";

export default function UserRoutes() {
  const role = localStorage.getItem("role");

  if (role && role !== "customer") {
    return <Route path="/*" element={<Navigate to="/admin" />} />;
  }

  return (
    <>
      {/* PUBLIC (không cần login) */}
      <Route path="/dangki" element={<Dangki />} />
      <Route path="/dangnhap" element={<Dangnhap />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* USER */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<Tc />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </>
  );
}