import { useEffect, useState } from "react";
import { Modal, Button, Form, Table, Spinner, Card } from "react-bootstrap";
import productApi from "@/api/productApi";
import uploadApi from "@/api/uploadApi";

export default function SanPham() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    quantity: "",
    description: "",
    image: "",
  });
  const [imageFile, setImageFile] = useState(null);

  const formatPrice = (p) => {
    if (!p && p !== 0) return "0 VND";
    const nghin = Math.floor(Number(p) / 1000);
    return `${nghin.toLocaleString("vi-VN")}.000 VND`;
  };

  const getInitialForm = () => ({
    name: "",
    price: "",
    quantity: "",
    description: "",
    image: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await productApi.getProducts({ limit: 100, page: 1 });
      // axiosClient interceptor trả response.data.data || response.data
      // Với backend có thể trả { products: [] } hoặc [{...}]
      const normalized = Array.isArray(res)
        ? res
        : res?.products || res?.data?.products || [];
      setProducts(normalized);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Chuẩn bị ảnh (giữ ảnh cũ hoặc mặc định rỗng)
      let finalImages = editing?.images || [];

      // 2. Tận dụng uploadApi khi chọn file mới
      if (imageFile) {
        const uploadRes = await uploadApi.uploadImages([imageFile]);
        if (uploadRes && uploadRes.length > 0) {
          finalImages = uploadRes;
        }
      }

      // 3. Dữ liệu sản phẩm (JSON)
      const productData = {
        name: form.name,
        price: Number(form.price),
        quantity: Number(form.quantity),
        description: form.description,
        images: finalImages,
      };

      if (editing) {
        await productApi.updateProduct(editing._id || editing.id, productData);
      } else {
        await productApi.createProduct(productData);
      }

      fetchData();
      setShow(false);
      setEditing(null);
      setForm({ name: "", price: "", quantity: "", description: "", image: "" });
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
    fetchData();
  };

  return (
    <div className="p-4">
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between mb-3">
            <h5 className="fw-bold">Quản lý sản phẩm ({products.length})</h5>
            <Button onClick={() => { setForm(getInitialForm()); setEditing(null); setImageFile(null); setShow(true); }}>
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
                    <td>{p.quantity}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={() => {
                          setEditing(p);
                          setForm({
                            name: p.name || "",
                            price: p.price || "",
                            quantity: p.quantity || "",
                            description: p.description || "",
                            image: p.images?.[0] || p.image || "",
                          });
                          setImageFile(null);
                          setShow(true);
                        }}
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
        </Card.Body>
      </Card>

      {/* MODAL */}
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Sửa" : "Thêm"} sản phẩm</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={save}>
            <Form.Control
              className="mb-2"
              placeholder="Tên sản phẩm"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Form.Control
              className="mb-2"
              type="number"
              placeholder="Giá"
              value={form.price || ""}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <Form.Control
              className="mb-2"
              type="number"
              placeholder="Số lượng"
              value={form.quantity || ""}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
            <Form.Control
              className="mb-2"
              as="textarea"
              placeholder="Mô tả"
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <Form.Control
              className="mb-2"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                setImageFile(file);
                const reader = new FileReader();
                reader.onload = () =>
                  setForm({ ...form, image: reader.result });
                reader.readAsDataURL(file);
              }}
            />

            {form.image && (
              <img
                src={form.image}
                width={90}
                style={{ borderRadius: 8 }}
                className="mb-2"
              />
            )}

            <div className="text-end">
              <Button type="submit">
                {editing ? "Cập nhật" : "Thêm"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}