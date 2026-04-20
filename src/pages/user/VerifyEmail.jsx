import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Container, Card, Spinner, Row, Col } from "react-bootstrap";
import { authApi } from "@/api";

// Màu chủ đạo Dermify
const DERMIFY_PINK = "#e60d78";

function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      return;
    }

    const verify = async () => {
      try {
        // Gọi API xác thực từ backend
        await authApi.verifyEmail(token);
        setStatus("success");

        // Sau 3 giây tự động đá sang trang đăng nhập
        setTimeout(() => {
          navigate("/dangnhap");
        }, 3000);

      } catch {
        setStatus("error");
      }
    };

    verify();
  }, [params, navigate]);

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={4}>
          <Card className="p-5 text-center shadow-lg border-0" style={{ borderRadius: "20px" }}>
            <Card.Body>
              {/* Brand Header */}
              <div className="mb-4">
                <h2 className="fw-bold" style={{ color: DERMIFY_PINK, letterSpacing: "2px" }}>
                  DERMIFY
                </h2>
              </div>

              {/* TRẠNG THÁI: ĐANG XỬ LÝ */}
              {status === "loading" && (
                <div className="py-4">
                  <Spinner 
                    animation="border" 
                    style={{ color: DERMIFY_PINK, width: "3rem", height: "3rem" }} 
                  />
                  <h5 className="mt-4 fw-bold text-secondary">Đang xác thực tài khoản...</h5>
                  <p className="text-muted small">Vui lòng đợi trong giây lát</p>
                </div>
              )}

              {/* TRẠNG THÁI: THÀNH CÔNG */}
              {status === "success" && (
                <div className="py-2">
                  <div className="display-1 text-success mb-3">✅</div>
                  <h4 className="fw-bold text-success">Xác thực thành công!</h4>
                  <p className="text-muted">Chào mừng bạn gia nhập Dermify.</p>
                  <hr className="my-4" />
                  <p className="small text-secondary">Hệ thống sẽ tự động chuyển sang trang đăng nhập sau 3 giây...</p>
                  <Link to="/dangnhap" className="fw-bold" style={{ color: DERMIFY_PINK, textDecoration: "none" }}>
                    Nhấn vào đây nếu bạn không muốn đợi
                  </Link>
                </div>
              )}

              {/* TRẠNG THÁI: LỖI */}
              {status === "error" && (
                <div className="py-2">
                  <div className="display-1 text-danger mb-3">❌</div>
                  <h4 className="fw-bold text-danger">Xác thực thất bại</h4>
                  <p className="text-muted">Link xác nhận đã hết hạn hoặc không hợp lệ.</p>
                  <div className="mt-4">
                    <Link 
                      to="/dangki" 
                      className="btn w-100 fw-bold text-white py-2" 
                      style={{ backgroundColor: DERMIFY_PINK, borderRadius: "10px" }}
                    >
                      ĐĂNG KÝ LẠI
                    </Link>
                  </div>
                </div>
              )}
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

export default VerifyEmail;
