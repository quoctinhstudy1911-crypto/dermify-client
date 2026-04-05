import { useState, useEffect } from "react";
import { 
  Button, Form, Container, Card, InputGroup, Spinner, Row, Col 
} from "react-bootstrap";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import { authApi } from "@/api";

const DERMIFY_PINK = "#e60d78";

function Dangnhap() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const { loginSuccess, user } = useAuthContext();
  
  const [formData, setFormData] = useState({ email: "", password: "" }); 
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(""); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // --- LOGIC QUAN TRỌNG: DỌN DẸP TOKEN ADMIN ---
      // Khi User đăng nhập, ta xóa sạch dấu vết của Admin để tránh axiosClient gửi nhầm token
      localStorage.removeItem("admin_accessToken");
      localStorage.removeItem("admin_refreshToken");
      localStorage.removeItem("admin_info");
      localStorage.removeItem("admin_role");

      const loginPayload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      const res = await authApi.login(loginPayload);

      // Kiểm tra vai trò của user
      if (res.role !== "customer") {
        setError("Tài khoản này không thuộc hệ thống người dùng (Customer)");
        setLoading(false);
        return;
      }

      // --- LƯU TRỮ TOKEN USER (Key chuẩn cho User) ---
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);

      const userData = {
        role: res.role,
      };
      localStorage.setItem("user", JSON.stringify(userData));

      // Update context toàn cục cho User
      loginSuccess(res.user);

      // Redirect về trang trước đó
      navigate(from, { replace: true });

    } catch (err) {
      setError(err?.message || "Sai email hoặc mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={4}>
          <Card className="p-4 shadow-lg border-0" style={{ borderRadius: "15px" }}>
            <Card.Body>
              <div className="text-center mb-4">
                <h2 className="fw-bold" style={{ color: DERMIFY_PINK, letterSpacing: "1px" }}>
                  DERMIFY
                </h2>
                <h5 className="fw-bold text-dark mt-2">Chào mừng quay trở lại!</h5>
              </div>

              {error && (
                <div className="alert alert-danger py-2 small text-center" role="alert">
                  {error}
                </div>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-secondary">EMAIL</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{ borderRadius: "10px", padding: "12px" }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-secondary">MẬT KHẨU</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Nhập mật khẩu"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      style={{ borderRadius: "10px 0 0 10px", padding: "12px" }}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ borderRadius: "0 10px 10px 0", borderLeft: "none" }}
                    >
                      {showPassword ? "👁️" : "🙈"}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Form.Check type="checkbox" label="Duy trì đăng nhập" className="small text-muted" />
                  <Link 
                    to="/forgot-password" 
                    className="small fw-bold" 
                    style={{ color: DERMIFY_PINK, textDecoration: "none" }}
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-100 fw-bold py-2 shadow-sm"
                  disabled={loading}
                  style={{
                    backgroundColor: DERMIFY_PINK,
                    border: "none",
                    borderRadius: "10px",
                  }}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      ĐANG XỬ LÝ...
                    </>
                  ) : (
                    "ĐĂNG NHẬP"
                  )}
                </Button>
              </Form>

              <div className="text-center mt-4 small">
                <span className="text-muted">Bạn chưa có tài khoản? </span>
                <Link 
                  to="/dangki" 
                  className="fw-bold" 
                  style={{ color: DERMIFY_PINK, textDecoration: "none" }}
                >
                  Đăng ký ngay
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dangnhap;