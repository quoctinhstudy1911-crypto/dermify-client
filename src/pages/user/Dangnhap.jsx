
import { useState } from "react";
import {
  Button,
  Form,
  Container,
  Card,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api";

// Trang đăng nhập người dùng
function Dangnhap() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Xóa lỗi khi người dùng gõ lại
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);

      const res = await authApi.login(formData);
      const token = res.token;
      const role = res.role;

      if (token) {
        // Lưu vào localStorage với key "token" (khớp với axiosClient)
        localStorage.setItem("token", token);
        // Lưu role vào localStorage để sử dụng sau này
         localStorage.setItem("role", role);
        // Hiển thị thông báo thành công và chuyển hướng về trang chủ
        alert("Đăng nhập thành công!");
        navigate("/"); 
      } else {
        setError("Không nhận được mã xác thực từ Server");
      }

    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      setError(
        err?.message || "Sai email hoặc mật khẩu"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card
        className="p-4 shadow-lg border-0"
        style={{ width: "100%", maxWidth: "400px", borderRadius: "15px" }}
      >
        <h3 className="text-center mb-4 fw-bold " style={{ color: "#e60d76" }}>
          ĐĂNG NHẬP
        </h3>

        {error && (
          <p className="text-danger text-center mb-3 small">{error}</p>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Nhập email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ borderRadius: "10px" }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ borderRadius: "10px 0 0 10px" }}
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                style={{ borderRadius: "0 10px 10px 0" }}
              >
                {showPassword ? "👁️" : "🙈"}
              </Button>
            </InputGroup>
          </Form.Group>

          <div className="d-flex justify-content-between mb-3">
            <Form.Check type="checkbox" label="Lưu Tài Khoản" className="small" />
            <span
              style={{
                cursor: "pointer",
                color: "#0d6efd",
                fontSize: "13px",
              }}
            >
              Quên mật khẩu?
            </span>
          </div>

          <Button
            type="submit"
            className="w-100 fw-bold"
            disabled={loading}
            style={{
              backgroundColor: "#e60d78",
              border: "none",
              borderRadius: "10px",
              padding: "10px",
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

        <div className="text-center mt-3 small">
          <span>Chưa có tài khoản? </span>
          <span
            style={{
              color: "#0d6efd",
              cursor: "pointer",
              fontWeight: "500",
            }}
            onClick={() => navigate("/dangki")}
          >
            Đăng ký
          </span>
        </div>
      </Card>
    </Container>
  );
}

export default Dangnhap;