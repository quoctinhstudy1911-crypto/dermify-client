import React, { useEffect, useState, useCallback } from "react";
import { Button, Form, Spinner, Alert } from "react-bootstrap";
import reviewApi from "@/api/reviewApi";
import orderApi from "@/api/orderApi";
import { useAuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProductReview = ({ productId }) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  const [formData, setFormData] = useState({
    rating: 5,
    comment: "",
  });

  const getSafeId = (obj) => obj?._id || obj?.id || obj;

  const fetchData = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      // Gọi song song để tối ưu thời gian load
      const [reviewRes, ordersRes] = await Promise.all([
        reviewApi.getProductReviews(productId),
        user
          ? orderApi.customer.getMyOrders()
          : Promise.resolve({ orders: [] }),
      ]);

      // Bóc tách reviews (linh hoạt theo nhiều cấu trúc trả về của axiosClient)
      const listReviews =
        reviewRes?.reviews || reviewRes?.data || reviewRes || [];
      setReviews(Array.isArray(listReviews) ? listReviews : []);

      if (user) {
        const myOrders = ordersRes?.orders || ordersRes || [];
        const hasBought = myOrders.some((order) => {
          const status = order.orderStatus?.toLowerCase();
          const isValidStatus = ["delivered", "completed"].includes(status);

          const hasProduct = (order.items || []).some(
            (item) => String(getSafeId(item.productId)) === String(productId),
          );

          return isValidStatus && hasProduct;
        });
        setCanReview(hasBought);
      }
    } catch (error) {
      console.error("Lỗi fetch data review:", error);
    } finally {
      setLoading(false);
    }
  }, [productId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderStars = (rating) => (
    <span className="text-warning fs-5">
      {"★".repeat(rating)}
      <span className="text-muted">{"☆".repeat(5 - rating)}</span>
    </span>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.comment.trim())
      return alert("Vui lòng nhập nội dung đánh giá!");

    try {
      setSubmitLoading(true);
      if (editingReviewId) {
        await reviewApi.updateReview(editingReviewId, formData);
        alert("Cập nhật thành công!");
      } else {
        await reviewApi.createReview({ productId, ...formData });
        alert("Cảm ơn bạn đã đánh giá!");
      }

      setFormData({ rating: 5, comment: "" });
      setEditingReviewId(null);
      fetchData();
    } catch (error) {
      alert(error.message || "Không thể thực hiện");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa?")) return;
    try {
      await reviewApi.deleteReview(id);
      fetchData();
    } catch (error) {
      alert(error.message || "Xóa thất bại");
    }
  };

  const handleEdit = (rev) => {
    setEditingReviewId(getSafeId(rev));
    setFormData({ rating: rev.rating, comment: rev.comment });
    const el = document.getElementById("review-form-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const hasReviewed = reviews.some(
    (r) => String(getSafeId(r.userId)) === String(getSafeId(user)),
  );

  return (
    <div className="mt-5 border-top pt-4">
      <h4 className="fw-bold mb-4 text-uppercase">Đánh giá từ khách hàng</h4>

      {user ? (
        canReview ? (
          !hasReviewed || editingReviewId ? (
            <div
              id="review-form-section"
              className="p-4 border rounded shadow-sm bg-light mb-5"
            >
              <h6 className="fw-bold mb-3">
                {editingReviewId ? " Sửa đánh giá" : "Viết đánh giá"}
              </h6>
              <Form onSubmit={handleSubmit}>
                <div className="mb-3">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <span
                      key={num}
                      style={{ cursor: "pointer", fontSize: "2rem" }}
                      className={
                        formData.rating >= num
                          ? "text-warning"
                          : "text-secondary"
                      }
                      onClick={() => setFormData({ ...formData, rating: num })}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Cảm nghĩ của bạn về sản phẩm..."
                  className="mb-3 shadow-sm"
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData({ ...formData, comment: e.target.value })
                  }
                />
                <div className="d-flex gap-2">
                  <Button variant="dark" type="submit" disabled={submitLoading}>
                    {submitLoading ? (
                      <Spinner size="sm" />
                    ) : editingReviewId ? (
                      "Cập nhật"
                    ) : (
                      "Gửi đánh giá"
                    )}
                  </Button>
                  {editingReviewId && (
                    <Button
                      variant="link"
                      className="text-secondary"
                      onClick={() => {
                        setEditingReviewId(null);
                        setFormData({ rating: 5, comment: "" });
                      }}
                    >
                      Hủy
                    </Button>
                  )}
                </div>
              </Form>
            </div>
          ) : (
            <Alert variant="info" className="border-0 shadow-sm">
              Bạn đã gửi đánh giá cho sản phẩm này.
            </Alert>
          )
        ) : (
          <Alert variant="warning" className="border-0 shadow-sm text-dark">
            Mua sản phẩm để nhận xét chất lượng.
          </Alert>
        )
      ) : (
        <Alert variant="light" className="text-center border py-4">
          <Button
            variant="outline-dark"
            size="sm"
            onClick={() => navigate("/dangnhap")}
          >
            Đăng nhập để đánh giá
          </Button>
        </Alert>
      )}

      <div className="review-list mt-4">
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="warning" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-muted text-center py-4">Chưa có đánh giá nào.</p>
        ) : (
          reviews.map((rev) => (
            <div
              key={getSafeId(rev)}
              className="d-flex gap-3 border-bottom py-4"
            >
              <img
                src={
                  rev.userId?.avatar ||
                  `https://ui-avatars.com/api/?name=${rev.userId?.name || "U"}&background=random`
                }
                width={50}
                height={50}
                className="rounded-circle shadow-sm"
                alt="avatar"
              />
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between">
                  <span className="fw-bold text-primary">
                    {rev.userId?.name || "Khách hàng"}
                  </span>
                  <small className="text-muted">
                    {new Date(rev.createdAt).toLocaleDateString("vi-VN")}
                  </small>
                </div>
                <div className="mb-1">{renderStars(rev.rating)}</div>
                <p className="mb-2">{rev.comment}</p>
                {rev.isEdited && (
                  <small className="text-muted d-block mb-2 italic small">
                    Đã sửa
                  </small>
                )}
                {String(getSafeId(user)) === String(getSafeId(rev.userId)) && (
                  <div className="d-flex gap-3 mt-2">
                    <span
                      className="text-info"
                      style={{ cursor: "pointer", fontSize: "0.85rem" }}
                      onClick={() => handleEdit(rev)}
                    >
                      Sửa
                    </span>
                    <span
                      className="text-danger"
                      style={{ cursor: "pointer", fontSize: "0.85rem" }}
                      onClick={() => handleDelete(getSafeId(rev))}
                    >
                      Xóa
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReview;