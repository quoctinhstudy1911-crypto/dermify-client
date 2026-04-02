import { useEffect } from "react";
import { 
  Button, Container, Form, Nav, Navbar, 
  NavDropdown, Offcanvas, Badge 
} from "react-bootstrap";
import { FaShoppingCart, FaUser, FaUserPlus } from "react-icons/fa";
import { TbLogout } from "react-icons/tb";
import { BsPersonFillGear } from "react-icons/bs"; 
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext"; // Sử dụng Context để sync dữ liệu
import "./Navbar.css";

function MyNavbar() {
  // Lấy dữ liệu từ Context (user: thông tin người dùng, logout: hàm đăng xuất)
  const { user, logout } = useAuthContext(); 
  const navigate = useNavigate();
 
  return (
    <Navbar expand="lg" className="custom-navbar mb-3 shadow-sm py-3 px-lg-5 border-bottom">
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand-gold fs-5 fw-bold">
          DERMIFY
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="offcanvasNavbar" />

        <Navbar.Offcanvas id="offcanvasNavbar" placement="end">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Menu</Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body>
            <Nav className="justify-content-start flex-grow-1 pe-3 text-black">
              <Nav.Link as={Link} to="/" className="nav-link-custom">Trang chủ</Nav.Link>
              <NavDropdown title="Danh mục sản phẩm" className="nav-link-custom" id="nav-dropdown-products">
                <NavDropdown.Item as={Link} to="/category/skincare">Chăm sóc da</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/category/makeup">Trang điểm</NavDropdown.Item>
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

            <Nav className="align-items-center">
              {/* GIỎ HÀNG */}
              <Nav.Link as={Link} to="/cart" className="nav-link-custom position-relative me-2">
                <FaShoppingCart className="icon-gold fs-5" />
                <span className="ms-1">Giỏ hàng</span>
                {/* Sau này Tịnh thêm số lượng giỏ hàng ở đây */}
                <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle" style={{fontSize: '0.6rem'}}>
                  0
                </Badge>
              </Nav.Link>
              
              {/* TÀI KHOẢN */}
              <NavDropdown 
                align="end"
                title={
                  <span className="nav-link-custom d-inline-flex align-items-center">
                    <BsPersonFillGear className="icon-gold me-2 fs-5" /> 
                    <span className="fw-bold">
                      {user ? `Hi, ${user.name || 'Tịnh'}` : "Tài khoản"}
                    </span>
                  </span>
                } 
                id="nav-dropdown-auth"
              >
                {!user ? (
                  /* CHƯA ĐĂNG NHẬP */
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
                      <BsPersonFillGear className="me-2" /> Hồ sơ cá nhân 
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/orders">
                      <FaShoppingCart className="me-2" /> Đơn hàng của tôi
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item 
                      onClick={logout} 
                      className="text-danger fw-bold"
                    >
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