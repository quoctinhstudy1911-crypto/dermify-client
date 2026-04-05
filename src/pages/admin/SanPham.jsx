import { useEffect, useState } from "react";
import { Modal, Button, Form, Table, Spinner, Card } from "react-bootstrap";
import productApi from "@/api/productApi";
import uploadApi from "@/api/uploadApi";

const INITIAL_FORM = { name: "", price: "", quantity: "", description: "", image: "" };
const ITEMS_PER_PAGE = 10;

// Component Phân trang
const Pagination = ({ currentPage, totalPages, totalItems, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1));

  return (
    <div className="d-flex justify-content-center align-items-center gap-2 mt-4 flex-wrap">
      <Button 
        variant="outline-secondary" 
        size="sm" 
        disabled={currentPage === 1} 
        onClick={() => onPageChange(currentPage - 1)}
      >
        ← Trước
      </Button>

      <div className="d-flex gap-1 flex-wrap">
        {pages.map((page, i) => (
          <div key={page}>
            {i > 0 && pages[i - 1] !== page - 1 && <span className="px-2">...</span>}
            <Button
              variant={currentPage === page ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="outline-secondary"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Sau →
      </Button>

      <span className="ms-3 text-muted small">
        Trang {currentPage}/{totalPages} ({totalItems} sản phẩm)
      </span>
    </div>
  );
};

export default function SanPham() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  console.log("CALL API:", { limit: ITEMS_PER_PAGE, page: currentPage });
  const formatPrice = (p) => {
    if (!p && p !== 0) return "0 VND";
    const nghin = Math.floor(Number(p) / 1000);
    return `${nghin.toLocaleString("vi-VN")}.000 VND`;
  };

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await productApi.getProducts({ limit: ITEMS_PER_PAGE, page });
      
      // Xử lý response từ API
      let data = Array.isArray(res) ? res : res?.products || res?.data?.products || [];
      
      setProducts(data);
      setCurrentPage(page);

      // Xác định total pages
      if (res?.totalPages && res?.totalItems) {
        // Backend trả totalPages và totalItems
        setTotalPages(res.totalPages);
        setTotalItems(res.totalItems);
      } else if (totalCount > 0) {
        // Dùng totalCount từ init
        const pages = Math.ceil(totalCount / ITEMS_PER_PAGE);
        setTotalPages(pages);
        setTotalItems(totalCount);
      } else {
        // Fallback: giả định dựa trên độ dài dữ liệu
        const hasMoreData = data.length === ITEMS_PER_PAGE;
        const pages = hasMoreData ? page + 1 : page;
        setTotalPages(pages);
        setTotalItems(data.length > 0 ? page * ITEMS_PER_PAGE : 0);
      }
    } finally {
      setLoading(false);
    }
  };

  // Init: fetch total items
  useEffect(() => {
    (async () => {
      try {
        const res = await productApi.getProducts({ limit: 1, page: 1 });
        const total = res?.totalItems || res?.total || (Array.isArray(res) ? 1 : 0);
        if (total > 0) setTotalCount(total);
      } catch (err) {
        console.log("Get total items failed:", err.message);
      }
      fetchData(1);
    })();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Chuẩn bị ảnh (giữ ảnh cũ hoặc mặc định rỗng)
      let finalImages = editing?.images || [];

      // 2. Tận dụng uploadApi khi chọn file mới
      if (imageFile) {
        // Truyền trực tiếp imageFile (đối tượng File)
        const uploadRes = await uploadApi.uploadImages(imageFile); 

        // Vì axiosClient đã bóc lớp 'data', nên uploadRes sẽ là mảng URL: ["http://..."]
        if (Array.isArray(uploadRes) && uploadRes.length > 0) {
          finalImages = uploadRes; 
        }
      }

      // 3. Dữ liệu sản phẩm (JSON)
    const productData = {
      name: form.name,
      price: Number(form.price),
      stock: Number(form.quantity),
      description: form.description,
      images: finalImages,
    };

      if (editing) {
        await productApi.updateProduct(editing._id || editing.id, productData);
      } else {
        await productApi.createProduct(productData);
      }

      fetchData(1);
      setShow(false);
      setEditing(null);
      setForm(INITIAL_FORM);
      setImageFile(null);
      alert("Lưu sản phẩm thành công!");
    } catch (error) {
      alert(error.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Xóa sản phẩm?")) return;
    await productApi.deleteProduct(id);
    fetchData(currentPage);
  };

  const handleEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name || "",
      price: product.price || "",
      quantity: product.stock || "",
      description: product.description || "",
      image: product.images?.[0] || product.image || "",
    });
    setImageFile(null);
    setShow(true);
  };

  const renderFormInput = (field, type = "text", placeholder = "") => (
    <Form.Control
      key={field}
      className="mb-2"
      type={field === "description" ? undefined : type}
      as={field === "description" ? "textarea" : undefined}
      rows={field === "description" ? 3 : undefined}
      placeholder={placeholder}
      value={form[field] || ""}
      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
    />
  );

  return (
    <div className="p-4">
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between mb-3">
            <h5 className="fw-bold">Quản lý sản phẩm ({totalItems})</h5>
            <Button onClick={() => { setForm(INITIAL_FORM); setEditing(null); setImageFile(null); setShow(true); }}>
              + Thêm
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <Spinner />
            </div>
          ) : (
            <Table hover responsive className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>STT</th>
                  <th>Ảnh</th>
                  <th>Tên</th>
                  <th>Giá</th>
                  <th>SL</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {!products.length ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : products.map((p, i) => (
                  <tr key={p._id || i}>
                    <td>{i + 1}</td>
                    <td>
                      {(p.images?.[0] || p.image) ? (
                        <img
                          src={p.images?.[0] || p.image}
                          width={55}
                          height={55}
                          style={{ objectFit: "cover", borderRadius: 8 }}
                        />
                      ) : "no img"}
                    </td>
                    <td className="fw-semibold">{p.name}</td>
                    <td className="text-danger fw-bold">
                      {formatPrice(p.price)}
                    </td>
                    <td>{p.stock}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={() => handleEdit(p)}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => remove(p._id)}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            totalItems={totalItems}
            onPageChange={fetchData}
          />
        </Card.Body>
      </Card>

      {/* MODAL */}
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Sửa" : "Thêm"} sản phẩm</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={save}>
            {renderFormInput("name", "text", "Tên sản phẩm")}
            {renderFormInput("price", "number", "Giá")}
            {renderFormInput("quantity", "number", "Số lượng")}
            {renderFormInput("description", "text", "Mô tả")}

            <Form.Control
              className="mb-2"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setImageFile(file);
                const reader = new FileReader();
                reader.onload = () => setForm({ ...form, image: reader.result });
                reader.readAsDataURL(file);
              }}
            />

            {form.image && <img src={form.image} width={90} style={{ borderRadius: 8 }} className="mb-2" />}

            <div className="text-end">
              <Button type="submit">{editing ? "Cập nhật" : "Thêm"}</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}