import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Table, Card, Badge, Spinner, Alert } from "react-bootstrap";
import orderApi from "@/api/orderApi"; 

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        // orderApi đã bóc tách data qua axiosClient interceptor
        const response = await orderApi.customer.getOrderDetail(orderId);
        setOrder(response);
      } catch (err) {
        // Lấy message từ backend thông qua reject của axiosClient
        const errorMessage = err.message || "Không thể lấy thông tin đơn hàng";
        setError(errorMessage);
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrderDetail();
  }, [orderId]);

  // Helper để hiển thị màu sắc Badge cho trạng thái
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return "warning";
      case "confirmed": return "info";
      case "shipping": return "primary";
      case "delivered": return "success";
      case "cancelled": return "danger";
      default: return "secondary";
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" role="status" />
        <p className="mt-2">Đang tải chi tiết đơn hàng...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Lỗi: {error}</Alert>
        <Link to="/orders" className="btn btn-primary">Quay lại danh sách</Link>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="info">Không tìm thấy dữ liệu đơn hàng.</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="mb-4">
        <Link to="/orders" className="text-decoration-none text-muted">
          &larr; Quay lại danh sách đơn hàng
        </Link>
      </div>

      <Row>
        {/* A. Thông tin đơn hàng */}
        <Col md={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Mã đơn hàng: {order.orderCode}</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col sm={6}>
                  <p className="mb-1 text-muted small text-uppercase fw-bold">Ngày đặt</p>
                  <p>{new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                </Col>
                <Col sm={3}>
                  <p className="mb-1 text-muted small text-uppercase fw-bold">Trạng thái đơn</p>
                  <Badge bg={getStatusVariant(order.orderStatus)}>
                    {order.orderStatus}
                  </Badge>
                </Col>
                <Col sm={3}>
                  <p className="mb-1 text-muted small text-uppercase fw-bold">Thanh toán</p>
                  <Badge pill bg={order.paymentStatus === "paid" ? "success" : "warning"}>
                    {order.paymentStatus}
                  </Badge>
                </Col>
              </Row>

              {/* B. Danh sách sản phẩm */}
              <div className="mt-4">
                <h6 className="mb-3 fw-bold">Sản phẩm đã đặt</h6>
                <Table responsive hover>
                  <thead className="table-light">
                    <tr>
                      <th>Sản phẩm</th>
                      <th className="text-center">Đơn giá</th>
                      <th className="text-center">Số lượng</th>
                      <th className="text-end">Tổng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td className="text-center">{item.price.toLocaleString()}đ</td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end fw-bold">
                          {(item.price * item.quantity).toLocaleString()}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* D. Tổng cộng */}
              <hr />
              <div className="d-flex flex-column align-items-end">
                <div className="d-flex justify-content-between w-25">
                  <span className="text-muted">Tạm tính:</span>
                  <span>{order.subtotal?.toLocaleString()}đ</span>
                </div>
                <div className="d-flex justify-content-between w-25 fw-bold fs-5 text-danger mt-2">
                  <span>Tổng tiền:</span>
                  <span>{order.totalPrice?.toLocaleString()}đ</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* C. Địa chỉ giao hàng */}
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white fw-bold">
              Địa chỉ nhận hàng
            </Card.Header>
            <Card.Body>
              <p className="mb-1 fw-bold">{order.shippingAddress?.fullName}</p>
              <p className="mb-2 text-muted small">{order.shippingAddress?.phone}</p>
              <hr />
              <p className="mb-1 small">
                <span className="text-muted">Đường:</span> {order.shippingAddress?.street}
              </p>
              <p className="mb-1 small">
                <span className="text-muted">Phường/Xã:</span> {order.shippingAddress?.ward}
              </p>
              <p className="mb-1 small">
                <span className="text-muted">Quận/Huyện:</span> {order.shippingAddress?.district}
              </p>
              <p className="mb-0 small">
                <span className="text-muted">Thành phố:</span> {order.shippingAddress?.city}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderDetailPage;