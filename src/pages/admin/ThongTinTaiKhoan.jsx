import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function ThongTinTaiKhoan() {
  const navigate = useNavigate();
  const { role } = useAdminAuth();
  const isManager = role === "admin" || role === "super_admin";

  return (
    <Container fluid className="mt-4 mb-4">
      <h2 className="mb-4 fw-bold">👤 Thông tin tài khoản</h2>
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <p className="text-muted mb-4">
            Chọn loại tài khoản để xem chi tiết và quản lý trạng thái.
          </p>
          <Row className="g-3">
            <Col md={isManager ? 6 : 12}>
              <Button
                variant="primary"
                className="w-100 py-3"
                size="lg"
                onClick={() => navigate("/admin/users/customers")}
              >
                Tài khoản khách hàng
              </Button>
            </Col>
            {isManager && (
              <Col md={6}>
                <Button
                  variant="outline-primary"
                  className="w-100 py-3"
                  size="lg"
                  onClick={() => navigate("/admin/users/admins")}
                >
                  Tài khoản admin
                </Button>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}