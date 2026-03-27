import { useState } from "react";
import { Button, Form, Container, Row, Col, Card } from "react-bootstrap";
import { authApi } from "@/api";
import { useNavigate } from "react-router-dom";

function Dangki() {
    
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
  });
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isPhoneValid = (phone) => /^\d{10}$/.test(phone);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const finalData = {
      email: formData.email,
      password: formData.password,
      name: formData.name.trim(),
      phone: formData.phone,
    };

    if (
      !finalData.email.endsWith("@gmail.com") ||
      finalData.password.length < 8 ||
      !isPhoneValid(finalData.phone) ||
      formData.password !== formData.confirmPassword
    ) {
      setValidated(true);
      return;
    }

    try {
      setLoading(true);

      await authApi.register(finalData);

      const loginData = await authApi.login({
        email: finalData.email,
        password: finalData.password,
      });

      localStorage.setItem("token", loginData.token);
      localStorage.setItem("role", loginData.role);

      alert("Đăng ký thành công!");
      navigate("/");

    } catch (err) {
      setServerError(err?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm border-0 p-4">
            <h3 className="text-center mb-5 fw-bold" style={{ color: "#e60d76" }}>
              ĐĂNG KÝ THÀNH VIÊN
            </h3>

            {serverError && (
              <p className="text-danger text-center">{serverError}</p>
            )}

            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Họ và tên</Form.Label>
                <Form.Control
                  name="name"
                  type="text"
                  placeholder="Nhập họ tên"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  name="email"
                  type="email"
                  placeholder="xxx@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={
                    validated && !formData.email.endsWith("@gmail.com")
                  }
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Email phải có dạng @gmail.com
                </Form.Control.Feedback>
              </Form.Group>

              {/* PHONE */}
              <Form.Group className="mb-3">
                <Form.Label>Số điện thoại</Form.Label>
                <Form.Control
                  name="phone"
                  type="text"
                  placeholder="0xxxxxxxxx"
                  value={formData.phone}
                  onChange={handleChange}
                  isInvalid={validated && !isPhoneValid(formData.phone)}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Số điện thoại phải đúng 10 số
                </Form.Control.Feedback>
              </Form.Group>

              {/* PASSWORD */}
              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu</Form.Label>
                <Form.Control
                  name="password"
                  type="password"
                  placeholder="Ít nhất 8 ký tự"
                  value={formData.password}
                  onChange={handleChange}
                  isInvalid={validated && formData.password.length < 8}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Mật khẩu phải từ 8 ký tự trở lên
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Nhập lại mật khẩu</Form.Label>
                <Form.Control
                  name="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  isInvalid={
                    validated &&
                    formData.confirmPassword !== formData.password
                  }
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Mật khẩu nhập lại không khớp
                </Form.Control.Feedback>
              </Form.Group>

              <Button
                type="submit"
                className="w-100 fw-bold py-2"
                style={{ backgroundColor: "#e60d78", border: "none" }}
                disabled={loading}
              >
                {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ NGAY"}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dangki;