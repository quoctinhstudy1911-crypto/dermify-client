import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Card, Table, Image } from "react-bootstrap";
import { useCart } from "@/context/CartContext";
import orderApi from "@/api/orderApi";
import userApi from "@/api/userApi";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const { cart, refreshCart, cartCount } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // BƯỚC 1: TẠO BIẾN items từ cart.items (Backend structure)
  const items = cart?.items || [];

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    province: "",
    district: "",
    street: "",
    paymentMethod: "cod",
    note: ""
  });

  // BƯỚC 2: LOAD DEFAULT ADDRESS 
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
            street: defaultAddr.street || ""
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

    // BƯỚC 3: CHECK EMPTY CART DỰA TRÊN items
    if (items.length === 0) {
      alert("Giỏ hàng đang trống, không thể tạo đơn hàng!");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          province: formData.province,
          district: formData.district,
          street: formData.street
        },
        paymentMethod: formData.paymentMethod,
        note: formData.note
      };

      const res = await orderApi.customer.createOrder(payload);

      if (res) {
        await refreshCart();
        navigate("/order-success", {
          state: { orderCode: res.orderCode }
        });
      }
    } catch (error) {
      const errorMsg = error.message || "Lỗi hệ thống khi tạo đơn";
      alert("Thất bại: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // BƯỚC 4: TÍNH TOÁN DỰA TRÊN items
  const subtotal = items.reduce((acc, item) => acc + (item.productId?.price * item.quantity), 0);
  const shippingFee = 30000;
  const totalPrice = subtotal + shippingFee;

  // Kiểm tra điền đủ thông tin để enable/disable nút bấm
  const isValid =
    formData.fullName &&
    formData.phone &&
    formData.province &&
    formData.district &&
    formData.street;

  return (
    <>
      <Container className="py-5">
        <h2 className="fw-bold mb-4">Thanh Toán</h2>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col lg={7}>
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

              <Card className="p-4 shadow-sm border-0 bg-light">
                <h5 className="fw-bold mb-3 border-bottom pb-2">Phương thức thanh toán</h5>
                {['cod', 'vnpay', 'momo', 'banking'].map((method) => (
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
                <h5 className="fw-bold mb-3">Đơn hàng của bạn ({cartCount})</h5>
                <div className="overflow-auto" style={{ maxHeight: "300px" }}>
                  <Table borderless size="sm">
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.productId?._id} className="align-middle border-bottom">
                          <td style={{ width: "60px" }} className="py-2">
                            <Image 
                              src={item.productId?.images?.[0]} 
                              width={50} height={50} 
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
                    <span className="fw-bold fs-4 text-danger">{totalPrice.toLocaleString()}đ</span>
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
    </>
  );
}

export default Checkout;