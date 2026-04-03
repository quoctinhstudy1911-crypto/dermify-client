import { useEffect, useState } from "react";
import { Button, Container, Form, Nav, Navbar, NavDropdown, Offcanvas, Badge } from "react-bootstrap";
import { FaShoppingCart, FaUser, FaUserPlus } from "react-icons/fa";
import { TbLogout } from "react-icons/tb";
import { BsPersonFillGear } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import categoryApi from "@/api/categoryApi";
import "./Navbar.css";
import { useCart } from "@/context/CartContext";

function MyNavbar() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cartCount } = useCart();
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await categoryApi.getCategoryTree();
        // Lấy dữ liệu mảng từ interceptor đã gỡ vỏ
        let dataArray = Array.isArray(res) ? res : (res?.data?.data || res?.data || []);
        setCategories(dataArray);
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <Navbar expand="lg" className="custom-navbar shadow-sm py-3 px-lg-5 border-bottom">
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand-gold fs-5 fw-bold text-white text-decoration-none">
          DERMIFY
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="offcanvasNavbar" />

        <Navbar.Offcanvas id="offcanvasNavbar" placement="end">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title className="fw-bold">Menu</Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body>
            {/* 1. NHÓM MENU CHÍNH */}
            <Nav className="flex-column flex-lg-row justify-content-start flex-grow-1 pe-3 align-items-lg-center">
              <Nav.Link as={Link} to="/" className="nav-link-custom py-2 py-lg-0">
                Trang chủ
              </Nav.Link>

              <NavDropdown 
                title="Danh mục sản phẩm" 
                className="nav-link-custom py-2 py-lg-0" 
                id="nav-dropdown-products"
              >
                {loading ? (
                  <NavDropdown.Item disabled>Đang tải...</NavDropdown.Item>
                ) : categories.length > 0 ? (
                  categories.map((parent) => (
                    <div key={parent._id || parent.id}>
                      {/* Link đến danh mục CHA */}
                      <NavDropdown.Item 
                        as={Link} 
                        to={`/category/${parent.slug}`} 
                        className="fw-bold text-primary"
                      >
                        {parent.name}
                      </NavDropdown.Item>
                      <NavDropdown.Divider />
                    </div>
                  ))
                ) : (
                  <NavDropdown.Item disabled>Không có dữ liệu</NavDropdown.Item>
                )}
              </NavDropdown>
            </Nav>

            {/* 2. Ô TÌM KIẾM */}
            <Form className="d-flex my-3 my-lg-0 me-lg-3 align-items-center">
              <Form.Control 
                type="search" 
                placeholder="Tìm sản phẩm..." 
                className="me-2 search-input-gold" 
              />
              <Button className="btn-gold">Tìm</Button>
            </Form>

            {/* 3. NHÓM TIỆN ÍCH (Giỏ hàng & Tài khoản) */}
            <Nav className="flex-column flex-lg-row align-items-start align-items-lg-center">
              
              {/* GIỎ HÀNG */}
              <Nav.Link 
                as={Link} 
                to="/cart" 
                className="nav-link-custom py-2 py-lg-0 me-lg-3 d-flex align-items-center position-relative w-100 w-lg-auto"
              >
                <div className="position-relative d-flex align-items-center">
                  <FaShoppingCart className="fs-5 me-2" />
                  <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: "0.6rem" }}>
                    {cartCount}
                  </Badge>
                </div>
                <span>Giỏ hàng</span>
              </Nav.Link>

              {/* TÀI KHOẢN */}
              <NavDropdown
                align="end"
                className="w-100 w-lg-auto py-2 py-lg-0"
                title={
                  <span className="nav-link-custom d-inline-flex align-items-center">
                    <BsPersonFillGear className="me-2 fs-5" />
                    <span className="fw-bold">
                        {/* Sửa lỗi undefined bằng cách kiểm tra nhiều trường dữ liệu */}
                        {user ? `Hi, ${user.name || user.fullName || "User"}` : "Tài khoản"}
                    </span>
                  </span>
                }
              >
                {!user ? (
                  <>
                    <NavDropdown.Item as={Link} to="/dangki"><FaUserPlus className="me-2" /> Đăng ký</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/dangnhap"><FaUser className="me-2" /> Đăng nhập</NavDropdown.Item>
                  </>
                ) : (
                  <>
                    <NavDropdown.Item as={Link} to="/profile">Hồ sơ cá nhân</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/orders">Đơn hàng của tôi</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item 
                      onClick={() => { logout(); navigate("/"); }} 
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