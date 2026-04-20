import { useState } from "react";
import { Button, Form, InputGroup, Spinner, Container, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { authApi, staffApi } from "@/api";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { EnvelopeFill, LockFill, EyeFill, EyeSlashFill } from "react-bootstrap-icons"; 
import "./DangNhap.css"; 

export default function DangNhap() {
  const navigate = useNavigate();
  const { loginAdmin } = useAdminAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      localStorage.removeItem("admin_accessToken");
      localStorage.removeItem("admin_refreshToken");
      localStorage.removeItem("admin_role");
      localStorage.removeItem("admin_info");

      const res = await authApi.login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const { accessToken, refreshToken, role } = res;

      if (!["staff", "admin", "super_admin"].includes(role)) {
        setError("Tài khoản không có quyền truy cập quản trị.");
        setLoading(false);
        return;
      }

      localStorage.setItem("admin_accessToken", accessToken);
      localStorage.setItem("admin_refreshToken", refreshToken);
      localStorage.setItem("admin_role", role);

      try {
        let staffInfo;
        // CHỈNH SỬA: Truyền trực tiếp headers để chắc chắn API nhận được Token vừa lưu
        const config = {
          headers: { Authorization: `Bearer ${accessToken}` }
        };

        if (role === "super_admin") {
          try {
            staffInfo = await staffApi.getMe(config); // Thêm config
          } catch {
            staffInfo = await authApi.getMe(config); // Thêm config
          }
        } else {
          staffInfo = await staffApi.getMe(config); // Thêm config
        }
        
        loginAdmin(staffInfo, role);
        navigate("/admin", { replace: true });

      } catch (err) {
        console.error("Lỗi xác thực staff:", err);
        localStorage.removeItem("admin_accessToken");
        localStorage.removeItem("admin_refreshToken");
        localStorage.removeItem("admin_role");
        localStorage.removeItem("admin_info");
        setError(err?.message || "Không thể lấy thông tin nhân viên. Vui lòng thử lại.");
      }
    } catch (err) {
      setError(err?.message || "Email hoặc mật khẩu không đúng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="admin-login-container p-0">
      <Row className="g-0 min-vh-100">
        {/* PANEL TRÁI: BRANDING */}
        <Col lg={7} className="d-none d-lg-flex left-panel align-items-center justify-content-center p-5 shadow-inset">
          <div className="text-center brand-content animate-fade-in">
            <div className="logo-box mb-4 mx-auto">D</div>
            <h1 className="fw-extrabold brand-title text-white">DERMIFY</h1>
            <p className="brand-subtitle text-white-50">Hệ Thống Quản Trị Chuyên Nghiệp</p>
          </div>
        </Col>

        {/* PANEL PHẢI: FORM */}
        <Col lg={5} className="d-flex align-items-center justify-content-center p-4 p-md-5 right-panel bg-white">
          <div className="login-form-wrapper w-100 animate-slide-up" style={{maxWidth: "400px"}}>
            <div className="mb-5 text-center text-lg-start">
              <h2 className="fw-bold text-dark mb-2">Quản Trị Viên</h2>
              <p className="text-muted small">Vui lòng đăng nhập để quản lý hệ thống</p>
            </div>

            {error && <Alert variant="danger" className="py-2 small border-0 mb-4 shadow-sm text-center">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-secondary">EMAIL HỆ THỐNG</Form.Label>
                <InputGroup className="input-group-custom shadow-sm">
                  <InputGroup.Text className="bg-white border-end-0">
                    <EnvelopeFill className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control 
                    type="email" 
                    name="email" 
                    placeholder="admin@dermify.vn" 
                    className="border-start-0 ps-0"
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-secondary">MẬT KHẨU</Form.Label>
                <InputGroup className="input-group-custom shadow-sm">
                  <InputGroup.Text className="bg-white border-end-0">
                    <LockFill className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    placeholder="••••••••"
                    className="border-start-0 border-end-0 ps-0"
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                  />
                  <Button variant="white" className="border-start-0" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeSlashFill className="text-muted" /> : <EyeFill className="text-muted" />}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Button type="submit" variant="primary" className="w-100 py-3 fw-bold btn-login shadow" disabled={loading}>
                {loading ? (
                  <><Spinner animation="border" size="sm" className="me-2" /> ĐANG XÁC THỰC...</>
                ) : (
                  "VÀO HỆ THỐNG"
                )}
              </Button>
            </Form>

            <div className="text-center mt-5">
              <a href="/" className="text-decoration-none small text-muted">← Quay lại trang chủ khách hàng</a>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
