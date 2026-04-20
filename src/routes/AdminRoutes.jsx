import { Route, Navigate, Outlet } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import SanPham from "../pages/admin/SanPham";
import DangNhap from "../pages/admin/DangNhap";
import DonHang from "@/pages/admin/DonHang";
import ChiTietDonHang from "@/pages/admin/ChiTietDonHang";
import ThongTinTaiKhoan from "@/pages/admin/ThongTinTaiKhoan";
import TaiKhoanUsers from "@/pages/admin/TaiKhoanUsers";
import TaiKhoanAdmin from "@/pages/admin/TaiKhoanAdmin";

const RequireAdmin = ({ roles = ["staff", "admin", "super_admin"] }) => {
  const token = localStorage.getItem("admin_accessToken");
  const role = localStorage.getItem("admin_role");

  if (!token) return <Navigate to="/admin/login" replace />;
  if (!roles.includes(role)) return <Navigate to="/admin" replace />;

  return <Outlet />;
};

export default function AdminRoutes() {
  return (
    <>
      <Route path="/admin/login" element={<DangNhap />} />

      <Route element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<DonHang />} />
          <Route path="/admin/orders/:orderId" element={<ChiTietDonHang />} />
          
          {/* TRANG HUB & KHÁCH HÀNG: Chỉ Admin/Super Admin mới được vào */}
          <Route element={<RequireAdmin roles={["admin", "super_admin"]} />}>
            <Route path="/admin/products" element={<SanPham />} />
            <Route path="/admin/users" element={<ThongTinTaiKhoan />} />
            <Route path="/admin/users/customers" element={<TaiKhoanUsers />} />
            <Route path="/admin/users/admins" element={<TaiKhoanAdmin />} />
          </Route>
        </Route>
      </Route>
    </>
  );
}