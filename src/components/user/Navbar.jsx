import { useEffect } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Offcanvas from "react-bootstrap/Offcanvas";
import { FaShoppingCart, FaUser, FaUserPlus } from "react-icons/fa";
import { TbLogout } from "react-icons/tb";
import { BsPersonFillGear } from "react-icons/bs"; 
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth"; // Import hook vừa tạo
import "./Navbar.css";

function MyNavbar() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Xóa toàn bộ dữ liệu đăng nhập
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    
    // Đẩy về trang chủ và load lại trang để xóa sạch state cũ
    window.location.href = "/";
  };

  return (
    <Navbar expand="lg" className="custom-navbar mb-3 shadow-sm py-3 px-lg-5 border-bottom">
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand-gold fs-5 fw-bold">
          Dermify - Mỹ Phẩm
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="offcanvasNavbar" />

        <Navbar.Offcanvas id="offcanvasNavbar" placement="end">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Menu</Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body>
            <Nav className="justify-content-start flex-grow-1 pe-3 text-black">
              <Nav.Link as={Link} to="/" className="nav-link-custom">Trang chủ</Nav.Link>
              <NavDropdown title="Danh mục sản phẩm" className="nav-link-custom">
                <NavDropdown.Item>Chăm sóc da</NavDropdown.Item>
                <NavDropdown.Item>Trang điểm</NavDropdown.Item>
              </NavDropdown>
            </Nav>

            <Form className="d-flex me-3">
              <Form.Control
                type="search"
                placeholder="Tìm sản phẩm..."
                className="me-2 search-input-gold" 
              />
              <Button className="btn-gold">Tìm</Button>
            </Form>

            <Nav>
              <Nav.Link as={Link} to="/cart" className="nav-link-custom">
                <FaShoppingCart className="icon-gold" /> Giỏ hàng
              </Nav.Link>
              
              <NavDropdown 
                title={
                  <span className="nav-link-custom">
                    <BsPersonFillGear className="icon-gold me-1" /> 
                    {/* Hiển thị tên nếu đã đăng nhập, không thì hiện "Tài khoản" */}
                    {user ? (user.name || user.email) : "Tài khoản"}
                  </span>
                } 
              >
                {/* CHƯA ĐĂNG NHẬP */}
                {!user ? (
                  <>
                    <NavDropdown.Item as={Link} to="/dangki"> 
                      <FaUserPlus className="me-2" />Đăng ký
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/dangnhap">
                      <FaUser className="me-2" /> Đăng nhập
                    </NavDropdown.Item>
                  </>
                ) : (
                  /* ĐÃ ĐĂNG NHẬP */
                  <>
                    <NavDropdown.Item as={Link} to="/profile">
                      <BsPersonFillGear className="me-2" /> Thông tin cá nhân 
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={handleLogout} className="text-danger">
                      <TbLogout className="me-2" /> Đăng xuất
                    </NavDropdown.Item>
                  </>
                )}
              </NavDropdown>
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

export default MyNavbar;