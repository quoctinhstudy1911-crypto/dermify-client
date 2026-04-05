import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner, Pagination } from "react-bootstrap";
import { Link, useParams, useLocation } from "react-router-dom";
import { productApi, categoryApi } from "@/api";
import "./ProductList.css";

function ProductList() {
  const { slug = "" } = useParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchKeyword = searchParams.get("search")?.trim() || "";

  // 1. Hàm lấy toàn bộ ID danh mục (Cha + Con)
  const getAllCategoryIds = (tree, targetSlug) => {
    const findNode = (nodes, target) => {
      for (let item of nodes) {
        if (item.slug === target) return item;
        if (item.children) {
          const found = findNode(item.children, target);
          if (found) return found;
        }
      }
      return null;
    };

    const targetNode = findNode(tree, targetSlug);
    if (!targetNode) return [];

    const ids = [targetNode._id || targetNode.id];
    const collectChildIds = (node) => {
      if (node.children) {
        node.children.forEach(child => {
          ids.push(child._id || child.id);
          collectChildIds(child);
        });
      }
    };
    collectChildIds(targetNode);
    return ids;
  };

  // 2. Hàm gọi API chính
  const fetchProducts = async () => {
    try {
      setLoading(true);
      let params = { page, limit: 8 };

      if (searchKeyword) params.search = searchKeyword;

      if (slug) {
        // VÌ AXIOS ĐÃ BÓC VỎ: cateRes ở đây là cái MẢNG trực tiếp
        const cateRes = await categoryApi.getCategoryTree();
        
        // Truyền thẳng mảng vào hàm xử lý ID
        const categoryIds = getAllCategoryIds(cateRes || [], slug);
        
        if (categoryIds.length > 0) {
          params.categoryId = categoryIds; 
        }
      }

      // VÌ AXIOS ĐÃ BÓC VỎ: res ở đây là Object { products, pagination } trực tiếp
      const res = await productApi.getProducts(params);
      
      // Gán trực tiếp vì không còn lớp .data nào nữa
      setProducts(res?.products || []);
      setPagination(res?.pagination || {});
      
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
      setProducts([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [slug, searchKeyword]);

  useEffect(() => {
    fetchProducts();
  }, [page, slug, searchKeyword]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <Container className="py-5">
      <h2 className="text-center mb-5 fw-bold text-uppercase brand-text">
        {searchKeyword 
          ? `Tìm kiếm: "${searchKeyword}"`
          : slug 
            ? `Danh mục: ${slug.replace(/-/g, ' ')}`
            : "Tất cả sản phẩm"}
      </h2>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" /> 
        </div>
      ) : (
        <>
          <Row>
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
                    <Card.Body className="d-flex flex-column p-3">
                      <Card.Title className="fs-6 fw-bold text-dark text-truncate">
                        {item.name}
                      </Card.Title>
                      <Card.Text className="text-muted small mb-2">
                        {item.brand}
                      </Card.Text>
                      <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="fw-bold text-danger fs-5">
                            {item.price?.toLocaleString()}đ
                          </span>
                        </div>
                        <Button 
                          as={Link} 
                          to={`/product/${item.slug}`} 
                          className="w-100 btn-gold rounded-pill border-0 py-2"
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
                <p className="fs-5 text-muted">Chưa có sản phẩm nào trong danh mục này.</p>
              </Col>
            )}
          </Row>

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
  );
}

export default ProductList;