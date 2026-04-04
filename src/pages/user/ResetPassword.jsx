import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import { authApi } from "@/api";

// Màu chủ đạo Dermify
const DERMIFY_PINK = "#e60d78";

function ResetPassword() {
  // Lấy token từ query params
  const [params] = useSearchParams();
  // Điều hướng sau khi đổi mật khẩu thành công
  const navigate = useNavigate();
  // State để quản lý form và thông báo
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  // State để quản lý loading và thông báo lỗi/thành công
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
 // Lấy token từ URL
  const token = params.get("token");

  // Xử lý submit form
  const handleSubmit = async (e) => {
    // Ngăn chặn hành vi submit mặc định của form
    e.preventDefault();
    
    // 1. Kiểm tra token
    if (!token) {
      setMessage({ type: "danger", text: "Mã xác thực không hợp lệ hoặc đã hết hạn!" });
      return;
    }

    // 2. Validate mật khẩu
    if (formData.password.length < 8) {
      setMessage({ type: "danger", text: "Mật khẩu phải từ 8 ký tự trở lên" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "danger", text: "Mật khẩu nhập lại không khớp" });
      return;
    }

    try {
      // 3. Gọi API đổi mật khẩu
      setLoading(true);
      setMessage({ type: "", text: "" });

      await authApi.resetPassword({
        token,
        password: formData.password,
      });

      alert("🎉 Đổi mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.");
      navigate("/dangnhap");

    } catch (err) {
      setMessage({ 
        type: "danger", 
        text: err?.response?.data?.message || err.message || "Đổi mật khẩu thất bại" 
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
              <div className="text-center mb-4">
                <h2 className="fw-bold" style={{ color: DERMIFY_PINK }}>DERMIFY</h2>
                <h5 className="fw-bold mt-3">Thiết lập mật khẩu mới</h5>
              </div>

              {message.text && (
                <div className={`alert alert-${message.type} small text-center py-2`} role="alert">
                  {message.text}
                </div>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-secondary text-uppercase">Mật khẩu mới</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Nhập ít nhất 8 ký tự"
                    style={{ borderRadius: "8px", padding: "12px" }}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-secondary text-uppercase">Xác nhận mật khẩu</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    style={{ borderRadius: "8px", padding: "12px" }}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                  />
                </Form.Group>

                <Button 
                  type="submit"
                  className="w-100 fw-bold py-2 shadow-sm"
                  style={{ 
                    backgroundColor: DERMIFY_PINK, 
                    border: "none",
                    borderRadius: "10px"
                  }}
                  disabled={loading}
                >
                  {loading ? "ĐANG CẬP NHẬT..." : "XÁC NHẬN ĐỔI MẬT KHẨU"}
                </Button>

                <div className="text-center mt-3">
                  <Link to="/dangnhap" className="small text-muted text-decoration-none">
                    Quay lại đăng nhập
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ResetPassword;