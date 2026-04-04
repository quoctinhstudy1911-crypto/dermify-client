import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function NavbarAdmin({ user, logout }) {
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpenMenu(false);
    navigate("/admin/login");
  };

  return (
    <nav
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        padding: "0 24px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Logo */}
      <Link
        to="/admin"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          textDecoration: "none",
          color: "#111827",
          fontWeight: "700",
          fontSize: "18px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "16px",
          }}
        >
          D
        </div>
        DERMIFY
      </Link>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {user ? (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setOpenMenu(!openMenu)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px 12px",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                {(user.name || user.email)?.[0]?.toUpperCase() || "A"}
              </div>

              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "14px", fontWeight: "600" }}>
                  {user.name || "Admin"}
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  {user.email}
                </div>
              </div>
            </button>

            {openMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "8px",
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
                  minWidth: "180px",
                }}
              >
                <a
                  href="/admin/profile"
                  style={{ display: "block", padding: "10px 16px" }}
                >
                  👤 Tài khoản
                </a>

                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    color: "red",
                    cursor: "pointer",
                  }}
                >
                  🚪 Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/admin/login")}
            className="btn btn-primary btn-sm"
          >
            Đăng nhập
          </button>
        )}
      </div>
    </nav>
  );
}