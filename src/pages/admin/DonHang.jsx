import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Spinner, Badge, Form, Card, Row, Col, InputGroup } from "react-bootstrap";
import { Filter, ChevronLeft, ChevronRight, CheckCircle, Truck, XCircle, Clock, CreditCard, RefreshCcw, Eye } from "lucide-react"; 
import orderApi from "@/api/orderApi";

export default function DonHang() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Gọi đúng hàm getAllOrders từ phần admin trong api của bạn
      const res = await orderApi.admin.getAllOrders({ page, status: statusFilter });
      setOrders(res.orders || []);
    } catch (err) {
      console.error("Lỗi load đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-1">📦 Quản lý đơn hàng</h3>
            <p className="text-muted small mb-0">Hệ thống quản trị Dermify</p>
          </div>
          <Button variant="white" className="border shadow-sm d-flex align-items-center gap-2" onClick={fetchOrders}>
            <RefreshCcw size={18} /> Làm mới
          </Button>
        </div>

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
                <span className="text-muted small">Tổng đơn hiện tại: <b className="text-dark">{orders.length}</b></span>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="border-0 shadow-sm overflow-hidden">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead className="bg-light border-bottom">
                    <tr>
                      <th className="ps-4 py-3 text-muted small text-uppercase">Mã đơn</th>
                      <th className="py-3 text-muted small text-uppercase">Khách hàng</th>
                      <th className="py-3 text-muted small text-uppercase">Tổng tiền</th>
                      <th className="py-3 text-muted small text-uppercase text-center">Trạng thái</th>
                      <th className="py-3 text-muted small text-uppercase text-center">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                    const orderId = o.id || o._id;
                    return (
                      <tr key={orderId || o.orderCode}>
                        <td className="ps-4 fw-bold">#{o.orderCode}</td>
                        <td>{o.customerId?.fullName || "Khách lẻ"}</td>
                        <td className="fw-bold">{o.totalPrice?.toLocaleString()}₫</td>
                        <td className="text-center">{renderStatus(o.orderStatus)}</td>
                        <td className="text-center">
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="px-3"
                            onClick={() => orderId && navigate(`/admin/orders/${orderId}`)}
                            disabled={!orderId}
                          >
                            <Eye size={14} className="me-1" /> Xem
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}