import { Route, Navigate, Outlet } from "react-router-dom";
// Import các component cần thiết
import AdminLayout from "../layouts/AdminLayout";
// Import các trang admin
import AdminDashboard from "../pages/admin/AdminDashboard";
import SanPham from "../pages/admin/SanPham";
import DangNhap from "../pages/admin/DangNhap";

// Component bảo vệ route dành cho admin
const RequireAdmin = () => {
  // Lấy token và role từ localStorage (khác với customer dùng context)
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
// Nếu không có token, chuyển hướng đến trang đăng nhập
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!["admin", "super_admin"].includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// Định nghĩa các route cho admin
export default function AdminRoutes() {
  return (
    <>
      {/* Route đăng nhập admin không cần bảo vệ */}
      <Route path="/admin/login" element={<DangNhap />} />
      
      {/* Các route admin khác được bảo vệ bởi RequireAdmin */}
      <Route element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<SanPham />} />
        </Route>
      </Route>
    </>
  );
}