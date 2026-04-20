import { Link, Outlet, useLocation } from "react-router-dom";
import NavbarAdmin from "../components/admin/Navbar_admin";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminLayout() {
  const location = useLocation();
  const { role } = useAdminAuth();

  // GIỮ NGUYÊN 4 MỤC TRONG CÂY DANH MỤC BẠN GỬI
  const navItems = [
    { path: "/admin", label: "Dashboard", icon: "DB" },
    { path: "/admin/orders", label: "Don hang", icon: "DH" },
    { path: "/admin/products", label: "San pham", icon: "SP", roles: ["admin", "super_admin"] },
    { path: "/admin/users", label: "Tai khoan", icon: "TK", roles: ["admin", "super_admin"] },
  ].filter((item) => !item.roles || item.roles.includes(role));

  const isActive = (path) => {
    if (path === "/admin") return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
      }}
    >
      <NavbarAdmin />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <aside
          style={{
            width: "260px",
            backgroundColor: "#ffffff",
            borderRight: "1px solid #e5e7eb",
            overflowY: "auto",
            padding: "24px 0",
          }}
        >
          <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {navItems.map((item) => {
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 20px",
                    color: active ? "#2563eb" : "#6b7280",
                    textDecoration: "none",
                    fontSize: "14px",
                    fontWeight: active ? "600" : "500",
                    background: active ? "#eff6ff" : "transparent",
                    borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
                    transition: "all 0.2s",
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      background: active ? "#dbeafe" : "#f3f4f6",
                    }}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}