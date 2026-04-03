import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner, Pagination } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import productApi from "@/api/productApi";
import categoryApi from "@/api/categoryApi";
import MyNavbar from "../../components/user/Navbar";
import "./ProductList.css";

function ProductList() {
  const { slug } = useParams(); 

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Hàm lấy ID danh mục từ Slug để lọc sản phẩm
  const fetchProductsBySlug = async (currentPage, currentSlug) => {
    try {
      setLoading(true);
      let params = { page: currentPage, limit: 8 };

      if (currentSlug) {
        // Lấy cây danh mục để tra cứu ID của slug hiện tại
        const cateRes = await categoryApi.getCategoryTree();
        const dataTree = Array.isArray(cateRes) ? cateRes : (cateRes?.data?.data || []);

        const findId = (tree, targetSlug) => {
          for (let item of tree) {
            if (item.slug === targetSlug) return item._id;
            if (item.children) {
              const childId = findId(item.children, targetSlug);
              if (childId) return childId;
            }
          }
          return null;
        };

        const categoryId = findId(dataTree, currentSlug);
        if (categoryId) params.categoryId = categoryId;
      }

      const res = await productApi.getProducts(params);
      setProducts(res.products || []);
      setPagination(res.pagination || {});
    } catch (error) {
      console.error("Lỗi:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsBySlug(page, slug);
  }, [page, slug]);

  useEffect(() => {
    setPage(1);
  }, [slug]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <MyNavbar />

      <Container className="py-5">
        <h2 className="text-center mb-4 fw-bold text-uppercase ">
          {slug ? `Danh mục: ${slug.replace(/-/g, ' ')}` : "Tất cả sản phẩm"}
        </h2>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="warning" />
          </div>
        ) : (
          <>
            <Row g={4}>
              {products.length > 0 ? (
                products.map((item) => (
                  <Col key={item._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                    <Card className="h-100 product-card shadow-sm border-0">
                      <div className="product-img-wrapper">
                        <Card.Img
                          variant="top"
                          src={item.images?.[0] || ""}
                          className="product-img"
                        />
                      </div>
                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="fs-6 fw-bold text-dark text-truncate">
                          {item.name}
                        </Card.Title>
                        <Card.Text className="text-muted small mb-1">
                          Thương hiệu: {item.brand}
                        </Card.Text>
                        <div className="mt-auto">
                          <span className="fw-bold text-danger d-block mb-2">
                            {item.price?.toLocaleString()}đ
                          </span>
                          <Button 
                            as={Link} 
                            to={`/product/${item.slug}`} 
                            variant="outline-dark" 
                            className="w-100 btn-sm rounded-pill"
                          >
                            Xem chi tiết
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col className="text-center py-5">
                  <p>Chưa có sản phẩm </p>
                </Col>
              )}
            </Row>

            {/* Phân trang */}
            {pagination.totalPages > 1 && (
              <div className="d-flex justify-content-center mt-5">
                <Pagination>
                  <Pagination.Prev disabled={page === 1} onClick={() => handlePageChange(page - 1)} />
                  {[...Array(pagination.totalPages).keys()].map((num) => (
                    <Pagination.Item
                      key={num + 1}
                      active={num + 1 === page}
                      onClick={() => handlePageChange(num + 1)}
                    >
                      {num + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next disabled={page === pagination.totalPages} onClick={() => handlePageChange(page + 1)} />
                </Pagination>
              </div>
            )}
          </>
        )}
      </Container>
    </>
  );
}

export default ProductList;