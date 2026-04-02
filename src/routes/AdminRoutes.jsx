import { Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import SanPham from "../pages/admin/SanPham";

export default function AdminRoutes() {
  return (
    <>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<SanPham />} />
      </Route>
    </>
  );
}
