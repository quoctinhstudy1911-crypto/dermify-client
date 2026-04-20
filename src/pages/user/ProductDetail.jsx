import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Container, Row, Col, Button, Spinner, Badge, Alert } from "react-bootstrap"; // Bổ sung Alert để báo lỗi đẹp hơn
import productApi from "@/api/productApi";
import cartApi from "@/api/cartApi";
import { useCart } from "@/context/CartContext";
import ProductReview from "./ProductReview";

function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { hash } = useLocation();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyLoading, setBuyLoading] = useState(false);

  const { refreshCart } = useCart();

  // ======================
  // SCROLL TO REVIEW
  // ======================
  useEffect(() => {
    if (hash.includes("review") && !loading && product) {
      const element = document.getElementById("review-form-section");

      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 500);
      }
    }
  }, [hash, loading, product]);

  // ======================
  // FETCH PRODUCT
  // ======================
  useEffect(() => {
    const fetchDetail = async () => {
      if (!slug) return;

      try {
        setLoading(true);

        const res = await productApi.getProductDetail(slug);

        if (res) {
          setProduct(res);
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [slug]);

  // ======================
  // ADD TO CART
  // ======================
  const handleAdd = async () => {
    // Bổ sung kiểm tra product tồn tại trước khi truy cập _id
    if (!product || product.stock <= 0) return alert("Sản phẩm đã hết hàng!");
    
    try {
      await cartApi.addToCart({
        productId: product._id,
        quantity: 1,
      });

      await refreshCart();
      alert("Đã thêm vào giỏ hàng!");
    } catch (error) {
      if (error.status === 401) {
        const hasToken = localStorage.getItem("accessToken");

        const message = hasToken
          ? "Phiên đăng nhập đã hết hạn. Đăng nhập lại?"
          : "Bạn cần đăng nhập để thêm sản phẩm. Đi đăng nhập?";

        if (window.confirm(message)) {
          navigate("/dangnhap");
        }
      } else {
        alert(error.message || "Lỗi thêm giỏ hàng");
      }
    }
  };

  // ======================
  // BUY NOW
  // ======================
  const handleBuyNow = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        alert("Bạn cần đăng nhập để mua hàng!");
        navigate("/dangnhap");
        return;
      }

      // Bổ sung kiểm tra product tồn tại
      if (!product || product.stock <= 0) return alert("Sản phẩm đã hết hàng!");

      setBuyLoading(true);

      navigate("/checkout", {
        state: {
          buyNowItem: {
            productId: product._id,
            productData: product,
            quantity: 1,
          },
        },
      });
    } catch (error) {
      alert(error.message || "Có lỗi xảy ra!");
    } finally {
      setBuyLoading(false);
    }
  };

  // ======================
  // LOADING STATE
  // ======================
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="warning" />
        <p className="mt-2 text-muted">Đang tải dữ liệu sản phẩm...</p>
      </div>
    );
  }

  // ======================
  // NOT FOUND STATE (Xử lý lỗi 404)
  // ======================
  if (!product) {
    return (
      <Container className="text-center py-5">
        <Alert variant="danger" className="d-inline-block p-4 shadow-sm">
           <h3 className="fw-bold">Không tìm thấy sản phẩm</h3>
           <p className="text-muted">Mã định danh "{slug}" không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
           <Button variant="dark" className="mt-3 rounded-pill px-4" onClick={() => navigate("/")}>
             Quay lại trang chủ
           </Button>
        </Alert>
      </Container>
    );
  }

  // ======================
  // RENDER MAIN UI
  // ======================
  return (
    <Container className="py-5">
      <Row>
      {/* IMAGE */}
      <Col md={6} className="mb-4">
        <div
          className="border rounded-3 overflow-hidden shadow-sm bg-light d-flex align-items-center justify-content-center"
          style={{ minHeight: "400px" }}
        >
          <img
            src={product.images?.[0] || "/no-image.png"}
            alt={product.name}
            className="img-fluid w-100"
            style={{ objectFit: "cover", height: "400px" }}
            onError={(e) => {
              e.target.onerror = null; // tránh loop
              e.target.src = "/no-image.png";
            }}
          />
        </div>
      </Col>

        {/* INFO */}
        <Col md={6}>
          <Badge bg="info" className="mb-2">
            {product.categoryId?.name || "Danh mục"}
          </Badge>

          <h1 className="fw-bold mb-3">{product.name}</h1>

          <p className="text-muted mb-4">
            Thương hiệu: <strong>{product.brand || "Đang cập nhật"}</strong>
          </p>

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
            <h5 className="fw-bold border-bottom pb-2">
              Mô tả sản phẩm:
            </h5>
            <p className="text-secondary mt-2" style={{ whiteSpace: "pre-line" }}>
              {product.description || "Đang cập nhật..."}
            </p>
          </div>

          <div className="d-grid gap-2">
            <Button
              variant="dark"
              size="lg"
              className="py-3 rounded-pill fw-bold"
              onClick={handleAdd}
              disabled={product.stock <= 0}
            >
              {product.stock > 0 ? "THÊM VÀO GIỎ" : "HẾT HÀNG"}
            </Button>

            <Button
              variant="outline-danger"
              size="lg"
              className="py-3 rounded-pill"
              onClick={handleBuyNow}
              disabled={buyLoading || product.stock <= 0}
            >
              {buyLoading ? <Spinner size="sm" /> : "MUA NGAY"}
            </Button>
          </div>

          <p className="mt-3 text-muted small">
            * Tình trạng:{" "}
            {product.stock > 0
              ? `Còn hàng (${product.stock})`
              : "Hết hàng"}
          </p>
        </Col>
      </Row>

      <hr className="my-5" />

      {/* REVIEW SECTION */}
      <Row id="review-form-section">
        <Col md={12}>
          {/* Đảm bảo product._id tồn tại mới render Review */}
          {product && <ProductReview productId={product._id} />}
        </Col>
      </Row>
    </Container>
  );
}

export default ProductDetail;