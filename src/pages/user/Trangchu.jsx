import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import DarkVariantExample from "@/components/user/Carousels";
import { productApi } from "@/api";

function Trangchu() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ======================
  // FETCH PRODUCTS
  // ======================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const res = await productApi.getProducts({
          page: 1,
          limit: 8, // lấy 8 sản phẩm nổi bật
        });

        setProducts(res.products || []);
      } catch (err) {
        console.error("Lỗi load sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      {/* CAROUSEL */}
      <DarkVariantExample />

      {/* PRODUCT LIST */}
      <Container className="py-5">
        <h3 className="fw-bold mb-4 text-center">🔥 Sản phẩm nổi bật</h3>

        {loading ? (
          <div className="text-center">
            <Spinner />
          </div>
        ) : (
          <Row>
            {products.map((item) => (
              <Col key={item._id} md={3} className="mb-4">
                <Card className="h-100 shadow-sm border-0">
                  <Card.Img
                    src={item.images?.[0] || "/no-image.png"}
                    style={{ height: 200, objectFit: "cover" }}
                  />

                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="fs-6 text-truncate">
                      {item.name}
                    </Card.Title>

                    <span className="text-danger fw-bold mb-2">
                      {item.price?.toLocaleString()}đ
                    </span>

                    <Button
                      as={Link}
                      to={`/product/${item.slug}`}
                      variant="dark"
                      size="sm"
                      className="mt-auto"
                    >
                      Xem chi tiết
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Nút xem tất cả */}
        <div className="text-center mt-4">
          <Button as={Link} to="/products" variant="outline-dark">
            Xem tất cả sản phẩm
          </Button>
        </div>
      </Container>
    </div>
  );
}

export default Trangchu;
