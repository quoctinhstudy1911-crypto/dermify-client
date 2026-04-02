import { Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";

export default function AdminRoutes() {
  const role = localStorage.getItem("role");

  if (!role || role === "customer") {
    return <Route path="/admin/*" element={<Navigate to="/" />} />;
  }

  return (
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<AdminDashboard />} />
    </Route>
  );
}