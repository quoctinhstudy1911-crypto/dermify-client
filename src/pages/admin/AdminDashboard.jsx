import React from "react";
import { useAuthContext } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
      </div>
    );
  }

  // Chưa login
  if (!user) {
    return (
      <div className="text-center" style={{ paddingTop: "60px" }}>
        <div style={{
          fontSize: "64px",
          marginBottom: "20px",
        }}>
          👋
        </div>
        <h2 className="fw-bold mb-3">Chào mừng đến Dashboard Admin</h2>
        <p className="text-muted mb-5" style={{ fontSize: "16px" }}>
          Vui lòng đăng nhập để truy cập các chức năng quản lý
        </p>
        <button
          onClick={() => {
            // Mở modal login bằng custom event
            window.dispatchEvent(new Event('openAdminLoginModal'));
          }}
          className="btn btn-primary btn-lg"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            borderRadius: "8px",
            padding: "12px 32px",
            fontSize: "16px",
          }}
        >
          🔐 Đăng nhập ngay
        </button>
      </div>
    );
  }

  // Đã login
  const stats = [
    { label: "Tổng sản phẩm", value: "0", icon: "📦", color: "#3b82f6" },
    { label: "Tổng đơn hàng", value: "0", icon: "🛒", color: "#10b981" },
    { label: "Tổng người dùng", value: "0", icon: "👥", color: "#f59e0b" },
    { label: "Doanh thu", value: "$0", icon: "💰", color: "#ef4444" },
  ];

  return (
    <div className="p-0">
      {/* Header */}
      <div className="mb-5">
        <h1 className="fw-bold mb-1">Dashboard</h1>
        <p className="text-muted">Chào mừng, <strong>{user.name || user.email}</strong></p>
      </div>

      {/* Stats Grid */}
      <div className="row g-3 mb-5">
        {stats.map((stat, idx) => (
          <div key={idx} className="col-12 col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{
              borderTop: `4px solid ${stat.color}`,
              borderRadius: "12px",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
            }}
            >
              <div className="card-body">
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>{stat.icon}</div>
                <h6 className="card-title text-muted mb-2" style={{ fontSize: "13px" }}>
                  {stat.label}
                </h6>
                <h3 className="fw-bold mb-0" style={{ color: stat.color }}>
                  {stat.value}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
        <div className="card-header border-bottom bg-light" style={{ borderRadius: "12px 12px 0 0" }}>
          <h5 className="mb-0 fw-bold">📊 Hoạt động gần đây</h5>
        </div>
        <div className="card-body">
          <div className="alert alert-light text-center mb-0">
            <p className="mb-0 text-muted">Chưa có dữ liệu hoạt động</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
        <div className="card-header border-bottom bg-light" style={{ borderRadius: "12px 12px 0 0" }}>
          <h5 className="mb-0 fw-bold">⚙️ Quản lý nhanh</h5>
        </div>
        <div className="card-body">
          <div className="row g-2">
            <div className="col-12 col-md-6">
              <a href="/admin/products" className="btn btn-outline-primary w-100 text-start">
                📦 Quản lý sản phẩm
              </a>
            </div>
            <div className="col-12 col-md-6">
              <a href="/admin/orders" className="btn btn-outline-success w-100 text-start">
                🛒 Quản lý đơn hàng
              </a>
            </div>
            <div className="col-12 col-md-6">
              <a href="/admin/users" className="btn btn-outline-warning w-100 text-start">
                👥 Quản lý người dùng
              </a>
            </div>
            <div className="col-12 col-md-6">
              <a href="/admin/settings" className="btn btn-outline-secondary w-100 text-start">
                ⚙️ Cài đặt hệ thống
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
