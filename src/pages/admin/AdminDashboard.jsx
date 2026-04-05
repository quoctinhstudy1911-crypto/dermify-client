import React, { useEffect, useState } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { Spinner, Card, Row, Col, ProgressBar, Badge } from "react-bootstrap";
import orderApi from "@/api/orderApi";

export default function AdminDashboard() {
  const { admin, loading } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const res = await orderApi.admin.getStatistics();
        setStats(res);
      } catch (err) {
        console.error("Lỗi dashboard:", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || loadingStats) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "80vh" }}>
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-secondary fw-medium">Đang khởi tạo dữ liệu...</p>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="text-center mt-5 p-5 bg-light rounded-3 mx-4">
        <h3 className="text-danger">⚠️ Truy cập bị từ chối</h3>
        <p>Vui lòng đăng nhập với quyền Admin để xem nội dung này.</p>
      </div>
    );
  }

  const overview = stats?.overview || {};

  const statCards = [
    { label: "Tổng đơn hàng", value: overview.totalOrders || 0, icon: "bi-cart-check", color: "#10b981", bg: "#ecfdf5" },
    { label: "Doanh thu", value: (overview.totalRevenue || 0).toLocaleString() + "đ", icon: "bi-currency-dollar", color: "#ef4444", bg: "#fef2f2" },
    { label: "Khách hàng", value: overview.totalCustomers || 0, icon: "bi-people", color: "#f59e0b", bg: "#fffbeb" },
    { label: "Giá trị TB", value: (overview.averageOrderValue || 0).toLocaleString() + "đ", icon: "bi-graph-up-arrow", color: "#3b82f6", bg: "#eff6ff" },
  ];

  return (
    <div className="p-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* HEADER */}
      <div className="mb-4 d-flex justify-content-between align-items-end">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Bảng điều khiển</h2>
          <p className="text-muted mb-0">
            Chào mừng trở lại, <span className="text-primary fw-semibold">{admin.name || admin.email}</span>
          </p>
        </div>
        <div className="text-muted small">Cập nhật cuối: {new Date().toLocaleTimeString()}</div>
      </div>

      {/* STATS CARDS */}
      <Row className="g-4 mb-4">
        {statCards.map((stat, idx) => (
          <Col md={6} lg={3} key={idx}>
            <Card className="h-100 border-0 shadow-sm transition-hover" style={{ borderRadius: "15px" }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center" 
                    style={{ width: "48px", height: "48px", backgroundColor: stat.bg, color: stat.color, fontSize: "1.2rem" }}
                  >
                    {/* Sử dụng Icon từ Bootstrap Icons hoặc giữ nguyên Emoji của bạn */}
                    <span role="img" aria-label={stat.label}>{stat.icon.startsWith('bi-') ? <i className={`bi ${stat.icon}`}></i> : stat.icon}</span>
                  </div>
                </div>
                <div className="text-muted small fw-medium uppercase mb-1">{stat.label}</div>
                <h3 className="fw-bold mb-0" style={{ color: "#1e293b" }}>{stat.value}</h3>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        {/* ORDER STATUS */}
        <Col lg={5}>
          <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: "15px" }}>
            <Card.Header className="bg-white border-0 pt-4 px-4 fw-bold d-flex align-items-center">
              <span className="me-2">📦</span> Trạng thái đơn hàng
            </Card.Header>
            <Card.Body className="p-4">
              {stats?.byStatus?.length ? (
                stats.byStatus.map((s) => (
                  <div key={s._id} className="mb-4">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fw-medium text-secondary">{s._id}</span>
                      <Badge bg="light" text="dark" className="border">{s.count} đơn</Badge>
                    </div>
                    <ProgressBar 
                       now={(s.count / (overview.totalOrders || 1)) * 100} 
                       variant="primary" 
                       style={{ height: "8px" }} 
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-5 text-muted">Không có dữ liệu đơn hàng</div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* TOP PRODUCTS */}
        <Col lg={7}>
          <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: "15px" }}>
            <Card.Header className="bg-white border-0 pt-4 px-4 fw-bold d-flex align-items-center">
              <span className="me-2">🔥</span> Sản phẩm bán chạy
            </Card.Header>
            <Card.Body className="p-4">
              {stats?.topProducts?.length ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0 small text-muted">TÊN SẢN PHẨM</th>
                        <th className="border-0 small text-muted text-end">SỐ LƯỢNG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topProducts.map((p) => (
                        <tr key={p.productId}>
                          <td className="fw-medium border-0">{p.name}</td>
                          <td className="text-end border-0">
                            <Badge pill bg="success" className="px-3">
                              {p.totalSold} đã bán
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5 text-muted">Chưa có dữ liệu sản phẩm</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Thêm chút CSS nhẹ nhàng */}
      <style>{`
        .transition-hover {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .transition-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
        }
        .progress-bar {
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}