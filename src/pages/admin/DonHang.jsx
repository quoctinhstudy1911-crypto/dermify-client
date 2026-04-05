import { useEffect, useState } from "react";
import { Table, Button, Spinner, Badge, Form, Card, Row, Col, InputGroup, Tooltip, OverlayTrigger } from "react-bootstrap";
import { 
  Filter, ChevronLeft, ChevronRight, CheckCircle, 
  Truck, XCircle, Clock, CreditCard, RefreshCcw 
} from "lucide-react"; 
import orderApi from "@/api/orderApi";

export default function DonHang() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderApi.admin.getAllOrders({ page, status: statusFilter });
      setOrders(res.orders || []);
    } catch (err) {
      console.error("Lỗi load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const handleUpdateStatus = async (orderId, status) => {
    if (!window.confirm(`Xác nhận chuyển đơn hàng sang trạng thái: ${status}?`)) return;
    try {
      await orderApi.admin.updateStatus(orderId, { status });
      fetchOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdatePayment = async (orderId) => {
    if (!window.confirm("Xác nhận khách hàng đã thanh toán thành công?")) return;
    try {
      await orderApi.admin.updatePayment(orderId, {
        paymentStatus: "paid",
        transactionId: "ADMIN_CONFIRM_" + Date.now()
      });
      fetchOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  // Helper render status với Icon
  const renderStatus = (status) => {
    const map = {
      pending: { color: "secondary", text: "Chờ xử lý", icon: <Clock size={14} className="me-1" /> },
      confirmed: { color: "info", text: "Đã xác nhận", icon: <CheckCircle size={14} className="me-1" /> },
      shipping: { color: "primary", text: "Đang giao", icon: <Truck size={14} className="me-1" /> },
      delivered: { color: "success", text: "Hoàn thành", icon: <CheckCircle size={14} className="me-1" /> },
      cancelled: { color: "danger", text: "Đã hủy", icon: <XCircle size={14} className="me-1" /> },
    };
    const config = map[status] || { color: "secondary", text: status, icon: null };
    return (
      <Badge pill bg={config.color} className="px-3 py-2 fw-medium d-inline-flex align-items-center">
        {config.icon} {config.text}
      </Badge>
    );
  };

  return (
    <div className="p-4 bg-light min-vh-100">
      <div className="container-fluid">
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-1">📦 Quản lý đơn hàng</h3>
            <p className="text-muted small mb-0">Hệ thống xử lý đơn hàng Dermify</p>
          </div>
          <Button variant="white" className="border shadow-sm d-flex align-items-center gap-2" onClick={fetchOrders}>
            <RefreshCcw size={18} /> Làm mới
          </Button>
        </div>

        {/* BỘ LỌC */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-3">
            <Row className="g-3 align-items-center">
              <Col md={4}>
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0">
                    <Filter size={18} className="text-muted" />
                  </InputGroup.Text>
                  <Form.Select 
                    className="border-start-0 ps-0 shadow-none" 
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="pending">⏳ Chờ xử lý</option>
                    <option value="confirmed">✅ Đã xác nhận</option>
                    <option value="shipping">🚚 Đang giao hàng</option>
                    <option value="delivered">🎉 Hoàn thành</option>
                    <option value="cancelled">❌ Đã hủy</option>
                  </Form.Select>
                </InputGroup>
              </Col>
              <Col className="text-end">
                <span className="text-muted small">Tổng cộng: <b className="text-dark">{orders.length}</b> đơn hàng</span>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* BẢNG DỮ LIỆU */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" size="lg" />
                <p className="mt-3 text-muted fw-medium">Đang đồng bộ dữ liệu...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead className="bg-light border-bottom">
                    <tr>
                      <th className="ps-4 py-3 text-muted small text-uppercase">Mã đơn</th>
                      <th className="py-3 text-muted small text-uppercase">Khách hàng</th>
                      <th className="py-3 text-muted small text-uppercase">Tổng tiền</th>
                      <th className="py-3 text-muted small text-uppercase">Thanh toán</th>
                      <th className="py-3 text-muted small text-uppercase">Trạng thái</th>
                      <th className="py-3 text-muted small text-uppercase text-center">Thao tác xử lý</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length > 0 ? (
                      orders.map((o) => (
                        <tr key={o.id} className="border-bottom-last-0">
                          <td className="ps-4">
                            <span className="fw-bold text-dark">#{o.orderCode}</span>
                          </td>
                          <td>
                            <div className="fw-bold text-secondary">{o.customerId?.fullName || "Khách vãng lai"}</div>
                            <div className="text-muted extra-small" style={{fontSize: '11px'}}>{o.id.substring(0,8)}...</div>
                          </td>
                          <td className="fw-bold text-dark">
                            {o.totalPrice?.toLocaleString()}₫
                          </td>
                          <td>
                            <Badge 
                              bg={o.paymentStatus === "paid" ? "success" : "warning"}
                              className={`px-2 py-1 ${o.paymentStatus === "paid" ? "bg-opacity-10 text-success" : "bg-opacity-10 text-warning"}`}
                              style={{ border: '1px solid currentColor' }}
                            >
                              <CreditCard size={12} className="me-1" />
                              {o.paymentStatus === "paid" ? "Đã trả" : "Chờ thu"}
                            </Badge>
                          </td>
                          <td>{renderStatus(o.orderStatus)}</td>
                          <td>
                            <div className="d-flex gap-2 justify-content-center">
                              {/* NHÓM NÚT CẬP NHẬT TRẠNG THÁI CHÍNH */}
                              {o.orderStatus === "pending" && (
                                <Button size="sm" variant="info" className="text-white px-3" onClick={() => handleUpdateStatus(o.id, "confirmed")}>
                                  Xác nhận đơn
                                </Button>
                              )}
                              
                              {o.orderStatus === "confirmed" && (
                                <Button size="sm" variant="primary" className="px-3" onClick={() => handleUpdateStatus(o.id, "shipping")}>
                                  Xuất kho & Giao
                                </Button>
                              )}

                              {o.orderStatus === "shipping" && (
                                <Button size="sm" variant="success" className="px-3" onClick={() => handleUpdateStatus(o.id, "delivered")}>
                                  Giao thành công
                                </Button>
                              )}

                              {/* NÚT THANH TOÁN - CHỈ HIỆN KHI CHƯA TRẢ */}
                              {o.paymentStatus === "pending" && o.orderStatus !== "cancelled" && (
                                <Button size="sm" variant="outline-success" onClick={() => handleUpdatePayment(o.id)}>
                                   💰 Đã nhận tiền
                                </Button>
                              )}

                              {/* NÚT HỦY - CHỈ HIỆN KHI CHƯA HOÀN THÀNH/HỦY */}
                              {o.orderStatus !== "delivered" && o.orderStatus !== "cancelled" && (
                                <Button size="sm" variant="link" className="text-danger p-0 ms-2 text-decoration-none shadow-none" onClick={() => handleUpdateStatus(o.id, "cancelled")}>
                                  Hủy đơn
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-5">
                          <img src="https://cdn-icons-png.flaticon.com/512/5058/5058436.png" width="60" className="mb-3 opacity-25" />
                          <p className="text-muted">Không tìm thấy đơn hàng nào phù hợp bộ lọc.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
          
          {/* PHÂN TRANG */}
          <Card.Footer className="bg-white border-top py-3">
            <div className="d-flex justify-content-center align-items-center gap-4">
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="rounded-circle p-2 d-flex align-items-center"
                disabled={page === 1}
                onClick={() => setPage(prev => prev - 1)}
              >
                <ChevronLeft size={18} />
              </Button>
              <span className="fw-bold">Trang {page}</span>
              <Button 
                variant="outline-secondary" 
                size="sm"
                className="rounded-circle p-2 d-flex align-items-center"
                onClick={() => setPage(prev => prev + 1)}
              >
                <ChevronRight size={18} />
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </div>
    </div>
  );
}