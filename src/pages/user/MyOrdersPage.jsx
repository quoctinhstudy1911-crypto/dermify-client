import { useEffect, useState } from "react";
import {
  Container,
  Table,
  Button,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import orderApi from "@/api/orderApi";

function MyOrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ======================
  // FETCH ORDERS
  // ======================
  const fetchOrders = async (isFirstLoad = false) => {
    try {
      if (isFirstLoad) setLoading(true); // Chỉ hiện spinner to ở lần tải đầu
      setError(null);

      const res = await orderApi.customer.getMyOrders();

      // axiosClient của bạn đã bóc tách res.data, nên ta kiểm tra các trường hợp
      const data = res?.orders || res?.data?.orders || res || [];
      setOrders(Array.isArray(data) ? data : []);

      console.log("Danh sách đơn hàng:", data);
    } catch (err) {
      if (err.status === 401) {
        // Không alert ở đây để tránh loop alert, điều hướng thẳng
        navigate("/dangnhap");
      } else {
        setError(err.message || "Lỗi khi lấy danh sách đơn hàng");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true; // Biến cờ để tránh gọi API khi component đã unmount

    if (isMounted) {
      fetchOrders(true);
    }

    return () => {
      isMounted = false; // Cleanup function
    };
  }, []); // Dependency rỗng đảm bảo chỉ chạy 1 lần khi mount

  // ======================
  // CANCEL ORDER
  // ======================
  const handleCancel = async (orderId) => {
    if (!orderId) {
      alert("Không tìm thấy mã đơn!");
      return;
    }

    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;

    try {
      await orderApi.customer.cancelOrder(orderId);
      alert("Hủy đơn thành công!");
      fetchOrders(false); // Reload lại danh sách nhưng không hiện Spinner to
    } catch (err) {
      alert(err.message || "Hủy đơn thất bại");
    }
  };

  // ======================
  // STATUS UI (Giữ nguyên logic của bạn)
  // ======================
  const getOrderStatusVariant = (status) => {
    const variants = {
      pending: "warning",
      confirmed: "info",
      shipping: "primary",
      delivered: "success",
      cancelled: "danger",
    };
    return variants[status] || "secondary";
  };

  const getStatusText = (status) => {
    const textMap = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      shipping: "Đang giao",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
    };
    return textMap[status] || status;
  };

  const getPaymentStatusVariant = (status) => {
    return status === "paid" ? "success" : "secondary";
  };

  // ======================
  // UI - Sửa lại phần render để tránh lỗi treo trang
  // ======================
  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4 text-primary">Đơn hàng của tôi</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Đang tải đơn hàng...</p>
        </div>
      ) : (
        <>
          {orders.length === 0 ? (
            <Alert variant="info" className="text-center">
              Bạn chưa có đơn hàng nào.
            </Alert>
          ) : (
            <Table bordered hover responsive className="align-middle shadow-sm">
              <thead className="table-light">
                <tr>
                  <th>Mã đơn</th>
                  <th>Sản phẩm</th>
                  <th>Giá</th>
                  <th>Trạng thái</th>
                  <th>Thanh toán</th>
                  <th>Ngày đặt</th>
                  <th className="text-center">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => {
                  const orderId = order.id || order._id;

                  return (
                    <tr key={orderId}>
                      <td className="fw-bold text-primary">
                        {order.orderCode}
                      </td>

                      <td style={{ minWidth: "250px" }}>
                        {order.items?.map((item, i) => (
                          <div
                            key={i}
                            className={`pb-2 ${i !== order.items.length - 1 ? "border-bottom mb-2" : ""}`}
                          >
                            <div className="fw-semibold small">{item.name}</div>
                            <div className="d-flex justify-content-between align-items-center mt-1">
                              <small className="text-muted">
                                SL: {item.quantity}
                              </small>
                              {order.orderStatus === "delivered" && (
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  className="btn-xs"
                                  style={{ fontSize: "0.7rem" }}
                                  onClick={() => {
                                    const target =
                                      item.productId?.slug ||
                                      item.productId?._id ||
                                      item.productId;
                                    if (target) {
                                      navigate(
                                        `/product/${target}#review-form-section`,
                                      );
                                    } else {
                                      alert(
                                        "Thông tin sản phẩm không khả dụng để đánh giá!",
                                      );
                                    }
                                  }}
                                >
                                  Đánh giá
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </td>

                      <td className="text-danger fw-bold">
                        {(order.totalPrice || 0).toLocaleString()}đ
                      </td>

                      <td>
                        <Badge bg={getOrderStatusVariant(order.orderStatus)}>
                          {getStatusText(order.orderStatus)}
                        </Badge>
                      </td>

                      <td>
                        <Badge
                          bg={getPaymentStatusVariant(order.paymentStatus)}
                        >
                          {order.paymentStatus === "paid"
                            ? "Đã thanh toán"
                            : "Chờ thanh toán"}
                        </Badge>
                      </td>

                      <td>
                        <small className="text-muted">
                          {new Date(order.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </small>
                      </td>

                      <td>
                        <div className="d-flex flex-column gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                            const id = order.id || order._id;

                            if (!id) {
                              console.log("ORDER LỖI:", order);
                              alert("Không có ID đơn hàng!");
                              return;
                            }

                            navigate(`/orders/${id}`);
                          }}
                          >
                            Xem chi tiết
                          </Button>

                          {order.orderStatus === "pending" && (
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleCancel(orderId)}
                            >
                              Hủy đơn
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </>
      )}
    </Container>
  );
}

export default MyOrdersPage;
