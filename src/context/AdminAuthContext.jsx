import { authApi } from "@/api";
import { createContext, useContext, useState, useEffect } from "react";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin_info");
    const storedRole = localStorage.getItem("admin_role");

    // Kiểm tra role hợp lệ và tồn tại dữ liệu admin
    if (storedAdmin && ["staff", "admin", "super_admin"].includes(storedRole)) {
      try {
        setAdmin(JSON.parse(storedAdmin));
        setRole(storedRole);
      } catch {
        // FIX LỖI LINT: Đã xóa biến 'err' dư thừa ở đây
        setAdmin(null);
        setRole(null);
        // Chỉ xóa dữ liệu liên quan đến admin để tránh ảnh hưởng đến session người dùng khác
        localStorage.removeItem("admin_info");
        localStorage.removeItem("admin_role");
        localStorage.removeItem("admin_accessToken");
        localStorage.removeItem("admin_refreshToken");
      }
    }
    setLoading(false);
  }, []);

  const loginAdmin = (adminData, adminRole) => {
    localStorage.setItem("admin_info", JSON.stringify(adminData));
    localStorage.setItem("admin_role", adminRole);
    setAdmin(adminData);
    setRole(adminRole);
  };

  const logoutAdmin = async () => {
    try {
      await authApi.logout(); 
    } catch {
      // FIX LỖI LINT: Đã xóa biến 'err' hoặc bọc catch an toàn
      console.warn("Logout API failed, clearing local storage anyway.");
    }

    localStorage.removeItem("admin_info");
    localStorage.removeItem("admin_role");
    localStorage.removeItem("admin_accessToken");
    localStorage.removeItem("admin_refreshToken");

    setAdmin(null);
    setRole(null);
  };

  // Các biến tiện ích dùng ở UI để phân quyền hiển thị component
  const isSuperAdmin = role === "super_admin";
  const isAnyAdmin = role === "admin" || role === "super_admin";

  return (
    <AdminAuthContext.Provider value={{ 
      admin, 
      role, 
      loading, 
      loginAdmin, 
      logoutAdmin,
      isSuperAdmin, 
      isAnyAdmin 
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};