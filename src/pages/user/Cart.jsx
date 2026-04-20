import { Container, Table, Button, Image, Row, Col } from "react-bootstrap";
import { useCart } from "@/context/CartContext";
import cartApi from "@/api/cartApi";
import { useNavigate } from "react-router-dom";

function Cart() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  const items = cart?.items || [];

  const handleUpdateQuantity = async (productId, newQty) => {
    try {
      await cartApi.updateCartItem({ 
        productId: productId, 
        quantity: newQty 
      });
      await refreshCart();
    } catch (error) {
      const msg = error.message || "Không thể cập nhật số lượng";
      alert(msg);
    }
  };

  const handleRemove = async (productId) => {
    if (window.confirm("Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      try {
        await cartApi.removeCartItem(productId);
        await refreshCart();
      } catch (error) {
        alert(error.message || "Lỗi khi xóa sản phẩm");
      }
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng không?")) {
      try {
        await cartApi.clearCart();
        await refreshCart();
      } catch (error) {
        alert(error.message || "Lỗi khi xóa giỏ hàng");
      }
    }
  };

  const totalBill = items.reduce((total, item) => {
    const price = item.productId?.price || 0;
    const quantity = item.quantity || 0;
    return total + (price * quantity);
  }, 0);

  return (
    <>
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">Giỏ hàng của bạn</h2>
          {items.length > 0 && (
            <Button variant="outline-danger" size="sm" onClick={handleClearCart}>
              Xóa tất cả
            </Button>
          )}
        </div>

        {items.length > 0 ? (
          <Row>
            <Col lg={8}>
              <Table responsive className="align-middle border-top">
                <thead>
                  <tr className="text-muted small text-uppercase">
                    <th>Sản phẩm</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Tổng</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.productId?._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <Image 
                            src={item.productId?.images?.[0] || null} 
                            width={70} height={70} 
                            className="rounded me-3 border"
                            style={{ objectFit: "cover" }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <div>
                            <div className="fw-bold text-dark">{item.productId?.name}</div>
                            <div className="text-muted small">{item.productId?.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td>{(item.productId?.price || 0).toLocaleString()}đ</td>
                      <td>
                        <div className="d-flex align-items-center border rounded-pill px-2 py-1" style={{ width: "fit-content" }}>
                          <Button 
                            variant="link" className="text-dark p-0 px-2 text-decoration-none"
                            onClick={() => handleUpdateQuantity(item.productId?._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </Button>
                          <span className="fw-bold px-2">{item.quantity}</span>
                          <Button 
                            variant="link" className="text-dark p-0 px-2 text-decoration-none"
                            onClick={() => handleUpdateQuantity(item.productId?._id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </td>
                      <td className="fw-bold text-danger">
                        {((item.productId?.price || 0) * item.quantity).toLocaleString()}đ
                      </td>
                      <td>
                        <Button 
                          variant="link" className="text-danger p-0"
                          onClick={() => handleRemove(item.productId?._id)}
                        >
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>

            <Col lg={4}>
              <div className="bg-light p-4 rounded shadow-sm border sticky-top" style={{ top: "20px" }}>
                <h5 className="fw-bold mb-4">Tóm tắt đơn hàng</h5>
                <div className="d-flex justify-content-between mb-3">
                  <span>Tạm tính:</span>
                  <span>{totalBill.toLocaleString()}đ</span>
                </div>
                <div className="d-flex justify-content-between mb-3 border-top pt-3">
                  <span className="fw-bold">Tổng cộng:</span>
                  <span className="fw-bold text-danger fs-4">{totalBill.toLocaleString()}đ</span>
                </div>
                <Button 
                  variant="dark" 
                  size="lg" 
                  className="w-100 mt-3 rounded-pill fw-bold"
                  onClick={() => navigate("/checkout")}
                >
                  THANH TOÁN NGAY
                </Button>
              </div>
            </Col>
          </Row>
        ) : (
          <div className="text-center py-5">
            <div className="mb-3 fs-1 text-muted">🛒</div>
            <p className="text-muted">Giỏ hàng của bạn đang trống!</p>
            <Button variant="outline-dark" onClick={() => navigate("/products")} className="rounded-pill px-4">
              Quay lại mua sắm
            </Button>
          </div>
        )}
      </Container>
    </>
  );
}

export default Cart;