import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import "./Navbar_admin.css";

export default function NavbarAdmin() {
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();
  const { admin, logoutAdmin } = useAdminAuth();

  const handleLogout = () => {
    logoutAdmin();
    setOpenMenu(false);
    navigate("/admin/login");
  };

  useEffect(() => {
    const close = (e) => { if (e.key === "Escape") setOpenMenu(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return (
    <nav className="admin-navbar">
      {/* LEFT: LOGO */}
      <Link to="/admin" className="navbar-logo">
        <div className="logo-box">D</div>
        <div className="brand-wrapper">
          <span className="brand-name">DERMIFY</span>
          <span className="brand-badge">ADMIN</span>
        </div>
      </Link>

      {/* RIGHT: USER SECTION */}
      <div className="navbar-right">
        {admin ? (
          <div className="user-menu-wrapper">
            <div 
              className={`user-profile-trigger ${openMenu ? "active" : ""}`} 
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu(!openMenu);
              }}
            >
              <div className="avatar-wrapper">
                <div className="avatar-circle">
                  {admin?.name?.[0]?.toUpperCase() || "A"}
                </div>
                <div className="online-indicator"></div>
              </div>
              
              <div className="user-info-text d-none d-md-flex">
                <span className="u-name">{admin?.name || "Administrator"}</span>
                <span className="u-role">Quản trị viên</span>
              </div>
              <span className={`arrow-icon ${openMenu ? "rotate" : ""}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
              </span>
            </div>

            {/* DROPDOWN MENU */}
            {openMenu && (
              <>
                <div className="menu-backdrop" onClick={() => setOpenMenu(false)} />
                <div className="dropdown-box shadow-lg animate-fade-in">
                  <div className="dropdown-header">
                    <p className="header-email">{admin?.accountId?.email || "admin@dermify.vn"}</p>
                  </div>
                  
                  <div className="menu-list">
                    <Link to="/admin/profile" className="menu-item" onClick={() => setOpenMenu(false)}>
                      <span className="menu-icon">👤</span> 
                      <span>Hồ sơ cá nhân</span>
                    </Link>
                    
                    <div className="menu-divider" />
                    
                    <button onClick={handleLogout} className="menu-item logout-red">
                      <span className="menu-icon">🚪</span> 
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <button onClick={() => navigate("/admin/login")} className="login-btn">
            Đăng nhập
          </button>
        )}
      </div>
    </nav>
  );
}