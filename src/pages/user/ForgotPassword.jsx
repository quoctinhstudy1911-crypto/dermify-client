import { useState } from "react";
import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import { authApi } from "@/api";
import { Link } from "react-router-dom";

// Màu chủ đạo Dermify
const DERMIFY_PINK = "#e60d78";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn trang reload
    if (!email.endsWith("@gmail.com")) {
      setMessage({ type: "danger", text: "Vui lòng nhập đúng định dạng Gmail" });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      
      await authApi.forgotPassword(email);
      
      setMessage({ 
        type: "success", 
        text: "🎯 Một liên kết đặt lại mật khẩu đã được gửi đến email của bạn!" 
      });
    } catch (err) {
      setMessage({ 
        type: "danger", 
        text: err?.response?.data?.message || "Không thể gửi email lúc này" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={4}>
          <Card className="shadow-lg border-0 p-4" style={{ borderRadius: "15px" }}>
            <Card.Body>
              {/* Logo/Brand Name */}
              <div className="text-center mb-4">
                <h2 className="fw-bold" style={{ color: DERMIFY_PINK, letterSpacing: "1px" }}>
                  DERMIFY
                </h2>
                <p className="text-muted small">Khôi phục quyền truy cập vào tài khoản của bạn</p>
              </div>

              <h4 className="fw-bold mb-3 text-center">Quên mật khẩu?</h4>

              {/* Thông báo lỗi/thành công */}
              {message.text && (
                <div className={`alert alert-${message.type} small text-center py-2`} role="alert">
                  {message.text}
                </div>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-secondary text-uppercase">Email đăng ký</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="example@gmail.com"
                    style={{ borderRadius: "8px", padding: "12px" }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button 
                  type="submit"
                  className="w-100 fw-bold py-2 mb-3 mt-2" 
                  style={{ 
                    backgroundColor: DERMIFY_PINK, 
                    border: "none",
                    borderRadius: "10px",
                    boxShadow: `0 4px 12px rgba(230, 13, 120, 0.2)`
                  }}
                  disabled={loading}
                >
                  {loading ? "ĐANG GỬI..." : "GỬI LIÊN KẾT PHỤC HỒI"}
                </Button>

                <div className="text-center mt-3">
                  <Link 
                    to="/dangnhap" 
                    className="small fw-bold" 
                    style={{ color: DERMIFY_PINK, textDecoration: "none" }}
                  >
                    <i className="bi bi-arrow-left me-1"></i> Quay lại Đăng nhập
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
          
          <p className="text-center text-muted mt-4 small">
            &copy; 2026 Dermify - Chăm sóc da chuyên nghiệp
          </p>
        </Col>
      </Row>
    </Container>
  );
}

export default ForgotPassword;