import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import { AdminLoginForm } from "@/pages/admin/DangNhap";

export default function NavbarAdmin({ user, logout }) {
  const [openMenu, setOpenMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Lắng nghe sự kiện mở modal từ dashboard
  useEffect(() => {
    const handleOpenLoginModal = () => {
      setShowLoginModal(true);
    };
    window.addEventListener('openAdminLoginModal', handleOpenLoginModal);
    return () => window.removeEventListener('openAdminLoginModal', handleOpenLoginModal);
  }, []);

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleLogout = () => {
    logout();
    setOpenMenu(false);
    window.location.reload();
  };

  return (
    <>
      <nav style={{
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        padding: "0 24px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link to="/admin" style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          textDecoration: "none",
          color: "#111827",
          fontWeight: "700",
          fontSize: "18px",
        }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "16px",
          }}>
            D
          </div>
          DERMIFY
        </Link>

        {/* Right Action - User Menu */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}>
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
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
                onMouseLeave={(e) => e.currentTarget.style.background = "none"}
              >
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "14px",
                  objectFit: "cover",
                }}>
                  {(user.name || user.email)?.[0]?.toUpperCase() || "A"}
                </div>
                <div style={{ textAlign: "left", minWidth: "120px" }}>
                  <div style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#111827",
                  }}>
                    {user.name || "Admin"}
                  </div>
                  <div style={{
                    fontSize: "12px",
                    color: "#6b7280",
                  }}>
                    {user.email}
                  </div>
                </div>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>▼</span>
              </button>

              {openMenu && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "8px",
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
                  zIndex: 1000,
                  minWidth: "180px",
                  overflow: "hidden",
                }}>
                  <div style={{ padding: "8px 0" }}>
                    <a href="/admin/profile" style={{
                      display: "block",
                      padding: "10px 16px",
                      fontSize: "14px",
                      color: "#374151",
                      textDecoration: "none",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      👤 Tài khoản của tôi
                    </a>
                    <a href="/admin/settings" style={{
                      display: "block",
                      padding: "10px 16px",
                      fontSize: "14px",
                      color: "#374151",
                      textDecoration: "none",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      ⚙️ Cài đặt
                    </a>
                    <hr style={{ margin: "8px 0" }} />
                    <button
                      onClick={() => {
                        logout();
                        window.location.reload();
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 16px",
                        fontSize: "14px",
                        color: "#dc2626",
                        background: "none",
                        border: "none",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#fef2f2"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      🚪 Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleLoginClick}
              className="btn btn-primary btn-sm"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">👨‍💼 Đăng nhập Admin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AdminLoginForm
            onSuccess={() => setShowLoginModal(false)}
            closeModal={() => setShowLoginModal(false)}
          />
        </Modal.Body>
      </Modal>
    </>
  );
}
