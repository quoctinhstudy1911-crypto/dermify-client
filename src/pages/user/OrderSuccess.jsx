import { Container, Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const orderCode = location.state?.orderCode;

  return (
    <Container className="text-center py-5">
      <h2 className="fw-bold text-success"> Đặt hàng thành công!</h2>

      <p className="mt-3">
        Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đã được ghi nhận.
      </p>

      {orderCode && (
        <p>
          Mã đơn hàng: <strong>{orderCode}</strong>
        </p>
      )}

      <div className="mt-4">
        <Button variant="dark" onClick={() => navigate("/orders")}>
          Xem đơn hàng
        </Button>

        <Button
          variant="outline-secondary"
          className="ms-2"
          onClick={() => navigate("/")}
        >
          Tiếp tục mua sắm
        </Button>
      </div>
    </Container>
  );
}