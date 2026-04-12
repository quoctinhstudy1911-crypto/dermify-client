import { useEffect, useState } from "react";
import { useParams,useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Spinner, Badge } from "react-bootstrap";
import productApi from "@/api/productApi";
import cartApi from "@/api/cartApi"; 
import { useCart } from "@/context/CartContext";


function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { refreshCart } = useCart();

  // Hàm xử lý thêm vào giỏ hàng bám sát tài liệu API
  const handleAdd = async () => {
      try {

        await cartApi.addToCart({ 
          productId: product._id, 
          quantity: 1 
        });
        
        await refreshCart(); 
        alert("Đã thêm vào giỏ hàng thành công! 🎉");

      } catch (error) {
        if (error.status === 401) {
          const hasToken = localStorage.getItem("accessToken");
          
          const message = hasToken 
            ? "Phiên đăng nhập đã hết hạn. Bạn có muốn đăng nhập lại không?" 
            : "Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Đi đến trang đăng nhập ngay?";

          if (window.confirm(message)) {
            navigate("/dangnhap");
          }
        } else {
          alert(error.message || "Có lỗi xảy ra khi thêm vào giỏ!");
        }
      }
    };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await productApi.getProductDetail(slug);
        setProduct(res);
      } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug]);

  if (loading) {
    return (
      <>
        
        <div className="text-center py-5">
          <Spinner animation="border" variant="warning" />
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        
        <div className="text-center py-5">Sản phẩm không tồn tại.</div>
      </>
    );
  }

  return (
    <>
     
      <Container className="py-5">
        <Row>
          <Col md={6} className="mb-4">
            <div className="border rounded overflow-hidden shadow-sm bg-light d-flex align-items-center justify-content-center" style={{ minHeight: "400px" }}>
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="img-fluid w-100"
                  style={{ objectFit: "cover", height: "400px" }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-muted italic small">Sản phẩm chưa có hình ảnh</div>
              )}
            </div>
          </Col>

          <Col md={6}>
            <Badge bg="info" className="mb-2">
              {product.categoryId?.name || "Danh mục"}
            </Badge>
            <h1 className="fw-bold mb-3">{product.name}</h1>
            <p className="text-muted mb-4">Thương hiệu: <strong>{product.brand}</strong></p>
            
            <div className="d-flex align-items-center gap-3 mb-4">
              <h2 className="text-danger fw-bold m-0">
                {product.price?.toLocaleString()}đ
              </h2>
              {product.originalPrice > product.price && (
                <span className="text-decoration-line-through text-muted fs-5">
                  {product.originalPrice?.toLocaleString()}đ
                </span>
              )}
            </div>

            <div className="mb-4">
              <h5 className="fw-bold border-bottom pb-2">Mô tả sản phẩm:</h5>
              <p className="text-secondary mt-2" style={{ whiteSpace: "pre-line" }}>
                {product.description || "Đang cập nhật mô tả cho sản phẩm này..."}
              </p>
            </div>

            <div className="d-grid gap-2">
              <Button 
                variant="dark" 
                size="lg" 
                className="py-3 rounded-pill fw-bold" 
                onClick={handleAdd}
              >
                THÊM VÀO GIỎ HÀNG
              </Button>
              <Button variant="outline-danger" size="lg" className="py-3 rounded-pill">
                MUA NGAY
              </Button>
            </div>
            
            <p className="mt-3 text-muted small italic">
              * Tình trạng: {product.stock > 0 ? `Còn hàng (${product.stock})` : "Hết hàng"}
            </p>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default ProductDetail;