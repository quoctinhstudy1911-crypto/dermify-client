import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Card, Table, Image } from "react-bootstrap";
import { useCart } from "@/context/CartContext";
import orderApi from "@/api/orderApi";
import userApi from "@/api/userApi";
import { useNavigate, useLocation } from "react-router-dom";

function Checkout() {
  const { cart, refreshCart, cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Nhận thông tin sản phẩm nếu đi từ luồng "Mua ngay"
  const buyNowItem = location.state?.buyNowItem;

  // BƯỚC 1: XÁC ĐỊNH DANH SÁCH ITEMS ĐỂ HIỂN THỊ VÀ GỬI API
  const items = buyNowItem
    ? [
        {
          productId: buyNowItem.productId, // Đối tượng chứa name, price, images...
          quantity: buyNowItem.quantity,
        },
      ]
    : cart?.items || [];

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    province: "",
    district: "",
    street: "",
    paymentMethod: "cod",
    note: "",
  });

  // BƯỚC 2: LOAD ĐỊA CHỈ MẶC ĐỊNH
  useEffect(() => {
    const loadDefaultAddress = async () => {
      try {
        const addresses = await userApi.getAddresses();
        const defaultAddr = addresses.find((a) => a.isDefault);

        if (defaultAddr) {
          setFormData((prev) => ({
            ...prev,
            fullName: defaultAddr.fullName || "",
            phone: defaultAddr.phone || "",
            province: defaultAddr.city || "",
            district: defaultAddr.district || "",
            street: defaultAddr.street || "",
          }));
        }
      } catch (err) {
        console.error("Lỗi load address:", err);
      }
    };
    loadDefaultAddress();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!items || items.length === 0) {
      alert("Không có sản phẩm để thanh toán!");
      return;
    }

    try {
      setLoading(true);

      // Chuẩn bị dữ liệu gửi lên Backend
        const payload = {
          shippingAddress: {
            fullName: formData.fullName,
            phone: formData.phone,
            province: formData.province,
            district: formData.district,
            street: formData.street,
          },
          paymentMethod: formData.paymentMethod,
          note: formData.note || "",

          isBuyNow: !!buyNowItem,

          items: items.map((item) => ({
            productId: item.productId?._id || item.productId,
            quantity: item.quantity,
          })),
        };

      const res = await orderApi.customer.createOrder(payload);

      if (res) {
        // TỐI ƯU: Chỉ làm mới giỏ hàng nếu đặt hàng từ Giỏ hàng (không phải mua ngay)
        if (!buyNowItem) {
          await refreshCart();
        }
        
        navigate("/order-success", { 
          state: { orderCode: res.orderCode } 
        });
      }
    } catch (error) {
      console.error("Lỗi tạo đơn hàng:", error.response?.data);
      const serverMessage = error.response?.data?.message || "Lỗi hệ thống khi tạo đơn";
      alert("Đặt hàng thất bại: " + serverMessage);
    } finally {
      setLoading(false);
    }
  };

  // LOGIC TÍNH TOÁN (Giữ nguyên)
  const subtotal = items.reduce(
    (acc, item) => acc + (item.productId?.price || 0) * item.quantity,
    0
  );
  const shippingFee = 30000;
  const totalPrice = subtotal + shippingFee;

  // Kiểm tra điều kiện bấm nút đặt hàng
  const isValid =
    items.length > 0 &&
    formData.fullName &&
    formData.phone &&
    formData.province &&
    formData.district &&
    formData.street;

  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4">Thanh Toán</h2>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col lg={7}>
            {/* Thông tin giao hàng */}
            <Card className="p-4 shadow-sm border-0 mb-4 bg-light">
              <h5 className="fw-bold mb-3 border-bottom pb-2">Thông tin giao hàng</h5>
              <Form.Group className="mb-3">
                <Form.Label>Họ và tên người nhận <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  name="fullName"
                  required
                  value={formData.fullName}
                  placeholder="Nguyễn Văn A"
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      name="phone"
                      required
                      value={formData.phone}
                      placeholder="0123456789"
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tỉnh / Thành phố <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      name="province"
                      required
                      value={formData.province}
                      placeholder="HCM"
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Quận / Huyện <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      name="district"
                      required
                      value={formData.district}
                      placeholder="Quận 1"
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Số nhà, tên đường <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      name="street"
                      required
                      value={formData.street}
                      placeholder="123 ABC"
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-0">
                <Form.Label>Ghi chú đơn hàng</Form.Label>
                <Form.Control
                  name="note"
                  as="textarea"
                  rows={2}
                  value={formData.note}
                  placeholder="Giao giờ hành chính..."
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Card>

            {/* Phương thức thanh toán */}
            <Card className="p-4 shadow-sm border-0 bg-light">
              <h5 className="fw-bold mb-3 border-bottom pb-2">Phương thức thanh toán</h5>
              {["cod", "vnpay", "momo", "banking"].map((method) => (
                <Form.Check
                  key={method}
                  type="radio"
                  label={method.toUpperCase()}
                  name="paymentMethod"
                  id={method}
                  value={method}
                  checked={formData.paymentMethod === method}
                  onChange={handleInputChange}
                  className="mb-2"
                />
              ))}
            </Card>
          </Col>

          <Col lg={5}>
            <Card className="p-4 shadow-sm border-0 sticky-top" style={{ top: "20px" }}>
              <h5 className="fw-bold mb-3">
                Đơn hàng của bạn ({buyNowItem ? 1 : cartCount})
              </h5>
              <div className="overflow-auto" style={{ maxHeight: "300px" }}>
                <Table borderless size="sm">
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.productId?._id || index} className="align-middle border-bottom">
                        <td style={{ width: "60px" }} className="py-2">
                          <Image
                            src={item.productId?.images?.[0] || item.productId?.image}
                            width={50}
                            height={50}
                            className="rounded border shadow-sm"
                            style={{ objectFit: "cover" }}
                          />
                        </td>
                        <td>
                          <div className="fw-bold small">{item.productId?.name}</div>
                          <div className="text-muted extra-small">Số lượng: {item.quantity}</div>
                        </td>
                        <td className="text-end fw-bold small">
                          {(item.productId?.price * item.quantity).toLocaleString()}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div className="mt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Tạm tính:</span>
                  <span>{subtotal.toLocaleString()}đ</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Phí vận chuyển:</span>
                  <span>{shippingFee.toLocaleString()}đ</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold fs-5">TỔNG CỘNG:</span>
                  <span className="fw-bold fs-4 text-danger">
                    {totalPrice.toLocaleString()}đ
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                variant="dark"
                size="lg"
                className="w-100 rounded-pill fw-bold py-3 mt-4"
                disabled={loading || !isValid}
              >
                {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT HÀNG"}
              </Button>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

export default Checkout;