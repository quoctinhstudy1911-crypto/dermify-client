import { useState } from "react";
import { Button, Form, InputGroup, Spinner, Container, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api";

export default function DangNhap() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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

  if (!formData.email || !formData.password) {
    setError("Vui lòng nhập đầy đủ thông tin");
    return;
  }

  try {
    setLoading(true);
    setError("");

    const loginPayload = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    const res = await authApi.login(loginPayload);

    const { accessToken, refreshToken, user } = res;

    // CHỈ CHO ADMIN LOGIN
    if (!["admin", "super_admin"].includes(user?.role)) {
      setError("Bạn không có quyền truy cập trang quản trị");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      return;
    }

    // Lưu token
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    // Lưu user
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    // Redirect admin
    navigate("/admin", { replace: true });

  } catch (err) {
    setError(err?.message || "Đăng nhập thất bại");
  } finally {
    setLoading(false);
  }
};

return (
    <Container className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card className="border-0 shadow-lg p-4" style={{ width: "100%", maxWidth: 400, borderRadius: "15px" }}>
        <Card.Body>
          <div className="text-center mb-4">
            <h3 className="fw-bold text-primary">ADMIN PANEL</h3>
            <p className="text-muted small">Vui lòng đăng nhập để tiếp tục</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small text-center border-0" role="alert">
              {error}
            </div>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">Email quản trị</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                style={{ padding: "0.75rem" }}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="small fw-semibold">Mật khẩu</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  style={{ padding: "0.75rem", borderRight: "none" }}
                />
                <Button 
                  variant="outline-secondary" 
                  style={{ borderLeft: "none", background: "transparent", color: "#6c757d" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "🙈"}
                </Button>
              </InputGroup>
            </Form.Group>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-100 py-2 fw-bold shadow-sm" 
              disabled={loading}
              style={{ borderRadius: "8px" }}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Đang xử lý...
                </>
              ) : (
                "ĐĂNG NHẬP"
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}