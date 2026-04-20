import { useEffect, useState, useCallback } from "react";
import { Modal, Button, Form, Table, Spinner, Card, Badge } from "react-bootstrap";
import { 
  Package, Plus, Edit3, Trash2, 
  ChevronLeft, ChevronRight, Image as ImageIcon 
} from "lucide-react";
import { productApi, uploadApi } from "@/api";
import { useAdminAuth } from "@/context/AdminAuthContext"; // Import context để check quyền

const INITIAL_FORM = { name: "", price: "", stock: "", description: "", images: [] };
const ITEMS_PER_PAGE = 8;

export default function SanPham() {
  const { role } = useAdminAuth(); // Lấy role hiện tại
  const isManager = role === "admin" || role === "super_admin"; // Kiểm tra quyền quản lý

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const formatPrice = (p) => new Intl.NumberFormat("vi-VN").format(p || 0) + " ₫";

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await productApi.getProducts({ 
        page: page, 
        limit: ITEMS_PER_PAGE 
      });
      const productList = res?.products || [];
      const pagination = res?.pagination || {};

      setProducts(productList);
      setTotalItems(pagination.totalProducts || productList.length);
      setTotalPages(pagination.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error("Lỗi fetch sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const handleShowModal = (product = null) => {
    if (product) {
      setEditing(product);
      setForm({
        name: product.name,
        price: product.price,
        stock: product.stock,
        description: product.description,
        images: product.images || [],
      });
      setPreviewImage(product.images?.[0] || "");
    } else {
      setEditing(null);
      setForm(INITIAL_FORM);
      setPreviewImage("");
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalImages = form.images;
      if (imageFile) {
        const uploadRes = await uploadApi.uploadImages(imageFile);
        if (Array.isArray(uploadRes) && uploadRes.length > 0) {
          finalImages = uploadRes;
        }
      }

      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        images: finalImages
      };

      if (editing) {
        await productApi.updateProduct(editing._id || editing.id, payload);
      } else {
        await productApi.createProduct(payload);
      }

      setShowModal(false);
      fetchData(currentPage);
      alert("Đã lưu thay đổi!");
    } catch (error) {
      alert(error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn muốn xóa sản phẩm này?")) return;
    try {
      await productApi.deleteProduct(id);
      fetchData(currentPage);
    } catch {
      alert("Lỗi khi xóa sản phẩm");
    }
  };

  return (
    <div className="p-4 bg-light min-vh-100">
      <Card className="border-0 shadow-sm" style={{ borderRadius: "15px" }}>
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold text-dark mb-1">📦 Kho Sản Phẩm</h3>
              <p className="text-muted small mb-0">
                Hiển thị <strong>{products.length}</strong> trên <strong>{totalItems}</strong> sản phẩm
              </p>
            </div>
            {/* Chỉ hiện nút Thêm mới nếu có quyền Manager */}
            {isManager && (
              <Button 
                className="d-flex align-items-center gap-2 px-4 py-2 fw-bold border-0"
                style={{ backgroundColor: "#4318FF", borderRadius: "10px" }}
                onClick={() => handleShowModal()}
              >
                <Plus size={18} /> Thêm mới
              </Button>
            )}
          </div>

          <div className="table-responsive">
            <Table hover className="align-middle mb-0" style={{ borderCollapse: "separate", borderSpacing: "0 10px" }}>
              <thead>
                <tr className="text-secondary small text-uppercase fw-bolder">
                  <th className="ps-4 border-0">STT</th>
                  <th className="border-0">Sản phẩm</th>
                  <th className="border-0">Giá niêm yết</th>
                  <th className="border-0 text-center">Tồn kho</th>
                  {isManager && <th className="border-0 text-end pe-4">Hành động</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                    </td>
                  </tr>
                ) : products.map((p, index) => (
                  <tr key={p._id || p.id} className="shadow-sm bg-white border-0">
                    <td className="ps-4 fw-bold text-secondary" style={{ borderRadius: "10px 0 0 10px" }}>
                      {(currentPage - 1) * ITEMS_PER_PAGE + (index + 1)}
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={p.images?.[0] || ""}
                          className="rounded-3 me-3 border"
                          style={{ width: "45px", height: "45px", objectFit: "cover" }}
                          onError={(e) => e.target.src = "https://placehold.co/50x50?text=IMG"}
                        />
                        <span className="fw-bold text-dark">{p.name}</span>
                      </div>
                    </td>
                    <td className="fw-bold text-primary">{formatPrice(p.price)}</td>
                    <td className="text-center">
                      <Badge 
                        bg={p.stock > 10 ? "success" : "danger"} 
                        className={`px-3 py-2 fw-medium ${p.stock > 10 ? "bg-opacity-10 text-success" : "bg-opacity-10 text-danger"}`}
                        style={{ border: '1px solid currentColor' }}
                      >
                        {p.stock} đơn vị
                      </Badge>
                    </td>
                    {/* Chỉ hiện các nút hành động Edit/Delete nếu là Manager */}
                    {isManager && (
                      <td className="text-end pe-4" style={{ borderRadius: "0 10px 10px 0" }}>
                        <Button variant="link" className="text-primary p-0 me-3 shadow-none" onClick={() => handleShowModal(p)}>
                          <Edit3 size={18} />
                        </Button>
                        <Button variant="link" className="text-danger p-0 shadow-none" onClick={() => handleDelete(p._id || p.id)}>
                          <Trash2 size={18} />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Pagination logic ... giữ nguyên */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
              <Button 
                variant="white" className="border rounded-circle p-2 shadow-sm"
                disabled={currentPage === 1} onClick={() => fetchData(currentPage - 1)}
              >
                <ChevronLeft size={20} />
              </Button>
              <span className="fw-bold">Trang {currentPage} / {totalPages}</span>
              <Button 
                variant="white" className="border rounded-circle p-2 shadow-sm"
                disabled={currentPage === totalPages} onClick={() => fetchData(currentPage + 1)}
              >
                <ChevronRight size={20} />
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal Form ... giữ nguyên phần JSX */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton className="border-0 pt-4 px-4">
            <Modal.Title className="fw-bold">{editing ? "Cập Nhật Sản Phẩm" : "Thêm Sản Phẩm Mới"}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
             {/* ... Nội dung form của bạn ... */}
             <div className="row g-4">
              <div className="col-md-5">
                <div className="rounded-4 border d-flex align-items-center justify-content-center bg-light mb-3" style={{ height: "280px" }}>
                  {previewImage ? (
                    <img src={previewImage} className="w-100 h-100 p-2" style={{ objectFit: "contain" }} />
                  ) : (
                    <div className="text-center text-muted">
                      <ImageIcon size={48} strokeWidth={1} />
                      <p className="small">Chưa có ảnh</p>
                    </div>
                  )}
                </div>
                <Form.Control type="file" size="sm" accept="image/*" onChange={(e) => {
                  const file = e.target.files[0];
                  if(file) { setImageFile(file); setPreviewImage(URL.createObjectURL(file)); }
                }} />
              </div>
              <div className="col-md-7">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Tên sản phẩm</Form.Label>
                  <Form.Control required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </Form.Group>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <Form.Label className="small fw-bold">Giá bán (₫)</Form.Label>
                    <Form.Control type="number" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                  </div>
                  <div className="col-6">
                    <Form.Label className="small fw-bold">Số lượng kho</Form.Label>
                    <Form.Control type="number" required value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
                  </div>
                </div>
                <Form.Group>
                  <Form.Label className="small fw-bold">Mô tả sản phẩm</Form.Label>
                  <Form.Control as="textarea" rows={5} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 p-4">
            <Button variant="light" className="px-4 fw-bold" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button type="submit" className="px-4 fw-bold text-white" style={{ backgroundColor: "#4318FF", border: "none" }} disabled={loading}>
              {loading ? "Đang lưu..." : "Xác nhận lưu"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}