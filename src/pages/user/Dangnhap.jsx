import { useState, useEffect } from "react";
import {  Button,  Form,  Container,  Card,  InputGroup,  Spinner,  Row,Col
} from "react-bootstrap";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import { authApi } from "@/api";

// Màu chủ đạo Dermify
const DERMIFY_PINK = "#e60d78";
// ================== CONTEXT ==================


function Dangnhap() {
  // Lấy location để biết người dùng đang ở trang nào trước khi bị chuyển đến trang đăng nhập
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const { loginSuccess, user } = useAuthContext(); // Lấy hàm loginSuccess từ AuthContext để cập nhật trạng thái đăng nhập toàn cục
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  }); 

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  // Nếu đã đăng nhập rồi thì không cho vào trang đăng nhập nữa, mà chuyển về trang chủ
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  // Xác định trang người dùng muốn truy cập trước khi bị chuyển đến trang đăng nhập
  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      // Clean dữ liệu trước khi gửi (quan trọng!)
      const loginPayload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      const res = await authApi.login(loginPayload);
      // Kiểm tra vai trò của user, nếu không phải customer thì không cho đăng nhập
      if (res.user?.role !== "customer") {
        setError("Tài khoản này không thuộc hệ thống người dùng");
        return;
      }
      // Lưu trữ thông tin (Sửa lại khớp với API trả về)
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      
      if (res.user) {
      localStorage.setItem("user", JSON.stringify(res.user));
      }

      // update context
      loginSuccess(res.user);

      // redirect về trang trước
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
                    placeholder="example@gmail.com"
                    name="email"
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
                      placeholder="Nhập mật khẩu"
                      name="password"
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
          <p className="text-center text-muted mt-4 small">
            &copy; 2026 Dermify Project - STU University
          </p>
        </Col>
      </Row>
    </Container>
  );
}

export default Dangnhap;