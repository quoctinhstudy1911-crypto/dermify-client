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

  // Kiểm tra số điện thoại 10 số, bắt đầu bằng số 0
  const isPhoneValid = (phone) => /^0\d{9}$/.test(phone);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const finalData = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      name: formData.name.trim(),
      phone: formData.phone,
    };

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalData.email);

    const isValid =
      isValidEmail &&
      finalData.password.length >= 8 &&
      isPhoneValid(finalData.phone) &&
      formData.password === formData.confirmPassword &&
      finalData.name !== "";

    if (!isValid) {
      setValidated(true);
      return;
    }

    try {
      setLoading(true);

      await authApi.register(finalData);

      alert("🎯 Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");

      navigate("/dangnhap");

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
              <div className="alert alert-danger text-center py-2" role="alert">
                {serverError}
              </div>
            )}

            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              {/* HỌ TÊN */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Họ và tên</Form.Label>
                <Form.Control
                  name="name"
                  type="text"
                  placeholder="Nhập họ tên"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập họ tên của bạn
                </Form.Control.Feedback>
              </Form.Group>

              {/* EMAIL */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Email</Form.Label>
                <Form.Control
                  name="email"
                  type="email"
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={validated && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Email phải có định dạng @gmail.com
                </Form.Control.Feedback>
              </Form.Group>

              {/* PHONE */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Số điện thoại</Form.Label>
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
                  Số điện thoại phải bắt đầu bằng số 0 và đủ 10 số
                </Form.Control.Feedback>
              </Form.Group>

              {/* PASSWORD */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Mật khẩu</Form.Label>
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

              {/* CONFIRM PASSWORD */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Nhập lại mật khẩu</Form.Label>
                <Form.Control
                  name="confirmPassword"
                  type="password"
                  placeholder="Xác nhận lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  isInvalid={
                    validated && formData.confirmPassword !== formData.password
                  }
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Mật khẩu xác nhận không khớp
                </Form.Control.Feedback>
              </Form.Group>

              <Button
                type="submit"
                className="w-100 fw-bold py-2 shadow-sm"
                style={{ backgroundColor: "#e60d78", border: "none" }}
                disabled={loading}
              >
                {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ NGAY"}
              </Button>

              <div className="text-center mt-3">
                <span>Đã có tài khoản? </span>
                <a href="/dangnhap" style={{ color: "#e60d78", textDecoration: "none" }} className="fw-bold">
                  Đăng nhập
                </a>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dangki;