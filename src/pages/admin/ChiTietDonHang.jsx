import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, ListGroup } from "react-bootstrap";
import { ChevronLeft, Printer, User, MapPin, CreditCard, Package, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import orderApi from "@/api/orderApi";
import { useAdminAuth } from "../../context/AdminAuthContext"; // Import context để lấy role

export default function ChiTietDonHang() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { role } = useAdminAuth(); // Lấy role hiện tại
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const res = await orderApi.admin.getOrderDetail(orderId);
      setOrder(res.order || res);
    } catch (err) {
      console.error("Lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;
    fetchOrderDetail();
  }, [orderId]);

  const customer = order?.customerId || {};
  const shipping = order?.shippingAddress || {};

  const shippingInfo = typeof shipping === "object" && shipping.fullName
    ? shipping
    : {
        fullName: shipping.fullName || customer.fullName || order?.shippingName || "Khách lẻ",
        phone: shipping.phone || customer.phone || order?.shippingPhone || "Chưa có",
        address: typeof shipping === "string" ? shipping : (shipping.address || "Chưa cập nhật"),
      };

  const trackingCode = order?.trackingNumber || order?.orderCode || orderId;
  const subtotal = order?.subtotal ?? order?.totalPrice ?? 0;
  const totalPrice = order?.totalPrice ?? subtotal;

  const renderStatusBadge = (status) => {
    const map = {
      pending: { color: "secondary", text: "Chờ xử lý" },
      confirmed: { color: "info", text: "Đã xác nhận" },
      shipping: { color: "primary", text: "Đang giao" },
      delivered: { color: "success", text: "Hoàn thành" },
      cancelled: { color: "danger", text: "Đã hủy" },
    };
    const config = map[status] || { color: "secondary", text: status || "Chưa rõ" };
    return (
      <Badge bg={config.color} className="text-uppercase px-3 py-2">
        {config.text}
      </Badge>
    );
  };

  const handleUpdateStatus = async (status) => {
    if (!window.confirm(`Xác nhận chuyển trạng thái sang: ${status}?`)) return;
    try {
      await orderApi.admin.updateStatus(orderId, { status });
      fetchOrderDetail();
    } catch (err) { alert(err.message || "Cập nhật trạng thái thất bại."); }
  };

  const handleUpdatePayment = async () => {
    if (!window.confirm("Xác nhận khách đã trả tiền?")) return;
    try {
      await orderApi.admin.updatePayment(orderId, {
        paymentStatus: "paid",
        transactionId: "ADMIN_CONFIRM_" + Date.now()
      });
      fetchOrderDetail();
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="text-center p-5 mt-5"><Spinner animation="border" variant="primary" /></div>;
  if (!order) return <Container className="mt-5 text-center"><h3>Không tìm thấy đơn hàng</h3><Button onClick={() => navigate(-1)}>Quay lại</Button></Container>;

  return (
    <div className="p-4 bg-light min-vh-100">
      <Container>
        <Button variant="link" className="text-decoration-none p-0 mb-3 d-flex align-items-center text-dark" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} /> Quay lại danh sách
        </Button>

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-end gap-3 mb-4">
          <div>
            <h2 className="fw-bold mb-1">#{trackingCode}</h2>
            <div className="text-muted">Mã vận đơn: {order.orderCode || orderId}</div>
            <div className="text-muted">Ngày đặt: {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "-"}</div>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {renderStatusBadge(order.orderStatus)}
            <Badge bg={order.paymentStatus === "paid" ? "success" : "warning"} className="text-uppercase px-3 py-2">
              {order.paymentStatus === "paid" ? "Đã trả" : "Chờ thu"}
            </Badge>
            <Button variant="outline-dark" onClick={() => window.print()} className="shadow-sm">
              <Printer size={18} className="me-2" /> In hóa đơn
            </Button>
          </div>
        </div>

        <Row>
          <Col lg={8}>
            {/* DANH SÁCH SẢN PHẨM */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-white py-3 fw-bold border-0">
                <Package size={20} className="me-2 text-primary" /> Danh sách sản phẩm
              </Card.Header>
              <Card.Body className="p-0">
                <Table responsive className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4">Sản phẩm</th>
                      <th>Đơn giá</th>
                      <th>Số lượng</th>
                      <th className="text-end pe-4">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, idx) => {
                      const product = item.productId || {};
                      const imageUrl = product.images?.[0] || product.image || item.image || "";
                      return (
                        <tr key={idx}>
                          <td className="ps-4 py-3">
                            <div className="d-flex align-items-center gap-3">
                              <div className="bg-white border rounded" style={{ width: 60, height: 60, overflow: "hidden" }}>
                                {imageUrl ? (
                                  <img src={imageUrl} alt={product.name || "Sản phẩm"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                  <div className="d-flex align-items-center justify-content-center h-100 text-muted">No image</div>
                                )}
                              </div>
                              <div>
                                <div className="fw-semibold">{product.name || item.name || "Sản phẩm chưa có tên"}</div>
                                {product.sku && <div className="text-muted small">SKU: {product.sku}</div>}
                              </div>
                            </div>
                          </td>
                          <td>{item.price?.toLocaleString()}₫</td>
                          <td>{item.quantity}</td>
                          <td className="text-end pe-4 fw-bold">{(item.price * item.quantity).toLocaleString()}₫</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Card.Body>
              <Card.Footer className="bg-white p-4 border-0">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal:</span>
                  <span>{subtotal?.toLocaleString()}₫</span>
                </div>
                <div className="d-flex justify-content-between fw-bold fs-4">
                  <span>Tổng thanh toán:</span>
                  <span className="text-primary">{totalPrice?.toLocaleString()}₫</span>
                </div>
              </Card.Footer>
            </Card>

            {/* KHỐI THAO TÁC XỬ LÝ (PHÂN QUYỀN TẠI ĐÂY) */}
            <Card className="border-0 shadow-sm border-start border-4 border-primary">
              <Card.Body>
                <h5 className="fw-bold mb-3">Thao tác xử lý nhanh</h5>
                <div className="d-flex gap-2 flex-wrap">
                  {/* Quyền chung cho cả Staff và Admin */}
                  {order.orderStatus === "pending" && (
                    <Button variant="info" className="text-white px-4" onClick={() => handleUpdateStatus("confirmed")}>Xác nhận đơn hàng</Button>
                  )}
                  {order.orderStatus === "confirmed" && (
                    <Button variant="primary" className="px-4" onClick={() => handleUpdateStatus("shipping")}>Xuất kho & Giao hàng</Button>
                  )}
                  {order.orderStatus === "shipping" && (
                    <Button variant="success" className="px-4" onClick={() => handleUpdateStatus("delivered")}>Xác nhận giao thành công</Button>
                  )}
                  
                  {/* Chỉ Admin/Super Admin được xác nhận thanh toán thủ công */}
                  {order.paymentStatus === "pending" && 
                   order.orderStatus !== "cancelled" && 
                   (role === "admin" || role === "super_admin") && (
                    <Button variant="outline-success" onClick={handleUpdatePayment}>💰 Xác nhận đã thanh toán</Button>
                  )}

                  {/* Chỉ Admin/Super Admin được quyền Hủy đơn */}
                  {order.orderStatus !== "delivered" && 
                   order.orderStatus !== "cancelled" && 
                   (role === "admin" || role === "super_admin") && (
                    <Button variant="outline-danger" onClick={() => handleUpdateStatus("cancelled")}>Hủy đơn</Button>
                  )}
                </div>
                {/* Thông báo cho Staff nếu không có quyền hủy/thanh toán */}
                {role === "staff" && order.orderStatus !== "cancelled" && order.orderStatus !== "delivered" && (
                   <div className="mt-2 text-muted small">
                     <i>* Lưu ý: Liên hệ Admin để thực hiện Hủy đơn hoặc Xác nhận thanh toán tiền mặt.</i>
                   </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            {/* THÔNG TIN KHÁCH HÀNG */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-white fw-bold py-3">Thông tin khách hàng</Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <div className="text-muted small">Tên</div>
                  <div className="fw-semibold">{shippingInfo.fullName}</div>
                </div>
                <div className="mb-3">
                  <div className="text-muted small">Số điện thoại</div>
                  <div className="fw-semibold">{shippingInfo.phone}</div>
                </div>
                <div className="mb-3">
                  <div className="text-muted small">Email</div>
                  <div className="fw-semibold">{customer.email || "Chưa có"}</div>
                </div>
                <div>
                  <div className="text-muted small">Địa chỉ nhận hàng</div>
                  <div className="fw-semibold">{shippingInfo.address}</div>
                </div>
              </Card.Body>
            </Card>

            {/* TRẠNG THÁI HIỆN TẠI */}
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white fw-bold py-3">Trạng thái đơn hàng</Card.Header>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                  Vận chuyển:
                  {renderStatusBadge(order.orderStatus)}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                  Thanh toán:
                  <Badge bg={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
                    {order.paymentStatus === 'paid' ? 'ĐÃ TRẢ' : 'CHỜ THU'}
                  </Badge>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}