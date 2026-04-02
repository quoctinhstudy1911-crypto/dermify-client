import { Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import SanPham from "../pages/admin/SanPham";
import DangNhap from "../pages/admin/DangNhap";

// Component bảo vệ route dành cho admin
const RequireAdmin = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  // chưa login
  if (!token) {
    return <Navigate to="/admin/login" />;
  }
  
  // không phải admin hoặc super_admin
  if (!["admin", "super_admin"].includes(role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default function AdminRoutes() {
  return (
    <>
      {/* LOGIN ADMIN */}
      <Route path="/admin/login" element={<DangNhap />} />

      {/* ADMIN (cần login) */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<SanPham />} />
      </Route>
    </>
  );
}