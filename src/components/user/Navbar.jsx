import React, { useEffect, useState, useMemo } from "react";
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
  const { cartCount } = useCart();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  // 1. FETCH DỮ LIỆU DANH MỤC
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await categoryApi.getCategoryTree();
        let dataArray = [];
        if (Array.isArray(res)) {
          dataArray = res;
        } else if (res?.data) {
          dataArray = Array.isArray(res.data) ? res.data : (res.data.data || []);
        }
        setCategories(dataArray);
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
        setCategories([]); 
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // 2. LỌC DANH MỤC CHA (Level 0)
  const parentCategories = useMemo(() => 
    categories.filter(cat => cat.level === 0 || !cat.parentId), 
  [categories]);

  // 3. XỬ LÝ TÌM KIẾM
  const handleSearch = (e) => {
    e.preventDefault();
    const cleanKeyword = keyword.trim();
    if (!cleanKeyword) return;
    navigate(`/products?search=${encodeURIComponent(cleanKeyword)}`);
  };

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
            {/* NHÓM MENU CHÍNH */}
            <Nav className="flex-column flex-lg-row justify-content-start flex-grow-1 pe-3 align-items-lg-center">
              <Nav.Link as={Link} to="/" className="nav-link-custom py-2 py-lg-0">
                Trang chủ
              </Nav.Link>

              {/* PHẦN CHỈNH SỬA: DROPDOWN DANH MỤC */}
              <NavDropdown 
                title="Danh mục sản phẩm" 
                className="nav-link-custom py-2 py-lg-0" 
                id="nav-dropdown-products"
              >
                {loading ? (
                  <NavDropdown.Item disabled className="text-center">Đang tải...</NavDropdown.Item>
                ) : categories.length > 0 ? (
                  <div className="category-menu-wrapper">
                    {parentCategories.map((parent) => (
                      <React.Fragment key={parent._id || parent.id}>
                        
                        {/* DANH MỤC CHA: Đã chuyển thành Item để có thể Click */}
                        <NavDropdown.Item 
                          as={Link} 
                          to={`/category/${parent.slug || parent._id}`} 
                          className="fw-bold text-primary bg-light py-2"
                        >
                          {parent.name?.toUpperCase()}
                        </NavDropdown.Item>

                        {/* DANH MỤC CON: Lọc theo parentId */}
                        {categories
                          .filter(sub => (sub.parentId === parent._id || sub.parentId === parent.id) && sub.level !== 0)
                          .map((sub) => (
                            <NavDropdown.Item 
                              key={sub._id || sub.id}
                              as={Link} 
                              to={`/category/${sub.slug || sub._id}`} 
                              className="ps-4 py-2"
                            >
                              — {sub.name}
                            </NavDropdown.Item>
                          ))}
                        <NavDropdown.Divider />
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <NavDropdown.Item disabled>Không có dữ liệu</NavDropdown.Item>
                )}
              </NavDropdown>
            </Nav>

            {/* Ô TÌM KIẾM */}
            <Form className="d-flex my-3 my-lg-0 me-lg-3 align-items-center" onSubmit={handleSearch}>
              <Form.Control 
                type="search" 
                placeholder="Tìm sản phẩm..." 
                className="me-2 search-input-gold"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <Button type="submit" className="btn-gold">Tìm</Button>
            </Form>

            {/* NHÓM TIỆN ÍCH */}
            <Nav className="flex-column flex-lg-row align-items-start align-items-lg-center">
              <Nav.Link as={Link} to="/cart" className="nav-link-custom py-2 py-lg-0 me-lg-3 d-flex align-items-center position-relative w-100 w-lg-auto">
                <div className="position-relative d-flex align-items-center me-2">
                  <FaShoppingCart className="fs-5" />
                  {cartCount > 0 && (
                    <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: "0.6rem" }}>
                      {cartCount}
                    </Badge>
                  )}
                </div>
                <span>Giỏ hàng</span>
              </Nav.Link>

              <NavDropdown
                align="end"
                className="w-100 w-lg-auto py-2 py-lg-0"
                title={
                  <span className="nav-link-custom d-inline-flex align-items-center">
                    <BsPersonFillGear className="me-2 fs-5" />
                    <span className="fw-bold">
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
                    <NavDropdown.Item onClick={() => { logout(); navigate("/"); }} className="text-danger fw-bold">
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