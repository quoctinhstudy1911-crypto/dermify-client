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

    const res = await authApi.login({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    });

    const { accessToken, refreshToken, role, user } = res;

    // check quyền
    if (!["admin", "super_admin"].includes(role)) {
      setError("Bạn không có quyền truy cập admin");
      return;
    }

    // lưu
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("role", role);

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    navigate("/admin/dashboard");

  } catch (err) {
    setError(err?.response?.data?.message || err.message || "Đăng nhập thất bại");
  } finally {
    setLoading(false);
  }
};

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-4 shadow" style={{ width: 400 }}>
        <h3 className="text-center mb-3">Admin Login</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <Form onSubmit={handleSubmit}>
          <Form.Control
            className="mb-3"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <InputGroup className="mb-3">
            <Form.Control
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button onClick={() => setShowPassword(!showPassword)}>
              👁
            </Button>
          </InputGroup>

          <Button type="submit" className="w-100" disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Đăng nhập Admin"}
          </Button>
        </Form>
      </Card>
    </Container>
  );
}