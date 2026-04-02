import { useState } from "react";
import {
  Button,
  Form,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { useAuthContext } from "@/context/AuthContext";
import { authApi } from "@/api";

// Component form đăng nhập dùng chung
export function AdminLoginForm({ onSuccess, onError, closeModal }) {
  const { loginSuccess } = useAuthContext();
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
    if (!formData.email || !formData.password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await authApi.login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const accessToken = res.accessToken || res.token || "";
      const refreshToken = res.refreshToken || "";
      const role = res.role || res.user?.role || "";
      const user =
        res.user ||
        ({
          _id: res._id || res.data?._id || null,
          name: res.name || res.username || "Admin",
          email: res.email || formData.email,
          role,
        });

      console.log("🔐 Login Response:", res);
      console.log("Token:", accessToken);
      console.log("Role:", role);
      console.log("User:", user);

      if (!accessToken || !role) {
        throw new Error("Dữ liệu đăng nhập không hợp lệ");
      }

      if (!["admin", "super_admin"].includes(role)) {
        throw new Error("Bạn không phải admin, không có quyền truy cập!");
      }

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("role", role);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("✅ Token saved to localStorage");
      await loginSuccess();
      setFormData({ email: "", password: "" });
      setShowPassword(false);

      if (onSuccess) onSuccess();
      // Duy trì reload để bảo đảm context lấy dữ liệu mới (nếu cần)
      window.location.reload();
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || "Sai email hoặc mật khẩu";
      setError(errMsg);
      if (onError) onError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
          <strong>Lỗi!</strong> {error}
          <button type="button" className="btn-close" onClick={() => setError("")}></button>
        </div>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label className="fw-bold mb-2">Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="admin@example.com"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              borderRadius: "8px",
              padding: "12px 15px",
              border: "1px solid #ddd",
              fontSize: "14px",
            }}
            className="focus-ring"
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label className="fw-bold mb-2">Mật khẩu</Form.Label>
          <InputGroup>
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                borderRadius: "8px 0 0 8px",
                padding: "12px 15px",
                border: "1px solid #ddd",
                fontSize: "14px",
              }}
              className="focus-ring"
            />
            <Button
              variant="outline-secondary"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                borderRadius: "0 8px 8px 0",
                border: "1px solid #ddd",
                borderLeft: "none",
                backgroundColor: "#f8f9fa",
              }}
            >
              {showPassword ? "👁️" : "🙈"}
            </Button>
          </InputGroup>
        </Form.Group>

        <Button
          type="submit"
          className="w-100 fw-bold py-3"
          disabled={loading}
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            color: "white",
          }}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Đang xử lý...
            </>
          ) : (
            "Đăng nhập"
          )}
        </Button>
      </Form>
    </>
  );
}

// Default export
export default AdminLoginForm;

