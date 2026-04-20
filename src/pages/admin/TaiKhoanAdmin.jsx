import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Button, Badge, Form, InputGroup, Spinner, Modal } from "react-bootstrap";
import { Search, UserCheck, UserX, Trash2, Plus, Edit } from "lucide-react";
import staffApi from "@/api/staffApi";

export default function TaiKhoanAdmin() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await staffApi.getAllStaff();
      setStaff(Array.isArray(res) ? res : res.staff || res.data || []);
    } catch (err) {
      console.error("Lỗi load admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSelectItem = (id) => {
    setSelectedStaff(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedStaff.length === filteredStaff.length) {
      setSelectedStaff([]);
    } else {
      setSelectedStaff(filteredStaff.map(s => s._id));
    }
  };

  const handleUpdateStatus = async (status) => {
    if (selectedStaff.length === 0) return alert("Chọn ít nhất một admin!");

    try {
      for (const id of selectedStaff) {
        await staffApi.updateStaff(id, { status });
      }
      alert(`Cập nhật thành công: ${status}`);
      fetchStaff();
      setSelectedStaff([]);
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (selectedStaff.length === 0) return alert("Chọn ít nhất một admin!");
    if (!window.confirm("Xác nhận xóa?")) return;

    try {
      for (const id of selectedStaff) {
        await staffApi.deleteStaff(id);
      }
      alert("Xóa thành công!");
      fetchStaff();
      setSelectedStaff([]);
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData(user);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.fullName || !formData.email) return alert("Nhập đầy đủ thông tin!");

    try {
      if (editingUser) {
        await staffApi.updateStaff(editingUser._id, formData);
      } else {
        await staffApi.createStaff(formData);
      }
      alert("Lưu thành công!");
      setShowModal(false);
      fetchStaff();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const renderStatusBadge = (status) => {
    return (
      <Badge bg={status === "active" ? "success" : "secondary"}>
        {status === "active" ? "✓ Hoạt động" : "Ngừng"}
      </Badge>
    );
  };

  const filteredStaff = staff.filter(s =>
    s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone?.includes(searchTerm) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="mt-4 mb-4">
      <h2 className="mb-4 fw-bold">🔐 Tài khoản admin</h2>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white">
          <Row className="align-items-center g-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text><Search size={18} /></InputGroup.Text>
                <Form.Control
                  placeholder="Tìm theo tên, SĐT, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="text-end">
              <Button variant="outline-success" size="sm" className="me-2" onClick={handleAdd}>
                <Plus size={16} className="me-1" /> Thêm
              </Button>
              <Button variant="outline-success" size="sm" className="me-2" onClick={() => handleUpdateStatus("active")}>
                <UserCheck size={16} className="me-1" /> Mở
              </Button>
              <Button variant="outline-warning" size="sm" className="me-2" onClick={() => handleUpdateStatus("inactive")}>
                <UserX size={16} className="me-1" /> Vô hiệu
              </Button>
              <Button variant="outline-danger" size="sm" onClick={handleDelete}>
                <Trash2 size={16} className="me-1" /> Xóa
              </Button>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" /></div>
          ) : (
            <div className="table-responsive">
              <Table striped hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th style={{ width: "50px" }}>
                      <Form.Check
                        type="checkbox"
                        checked={selectedStaff.length === filteredStaff.length && filteredStaff.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>SĐT</th>
                    <th>Văn phòng</th>
                    <th>Trạng thái</th>
                    <th style={{ width: "100px" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((s) => (
                    <tr key={s._id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedStaff.includes(s._id)}
                          onChange={() => handleSelectItem(s._id)}
                        />
                      </td>
                      <td className="fw-semibold">{s.fullName || "N/A"}</td>
                      <td>{s.email || "N/A"}</td>
                      <td>{s.phone || "N/A"}</td>
                      <td>{s.office || "N/A"}</td>
                      <td>{renderStatusBadge(s.status)}</td>
                      <td>
                        <Button variant="link" size="sm" onClick={() => handleEdit(s)}>
                          <Edit size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* MODAL THÊM/SỬA */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? "Sửa thông tin" : "Thêm mới"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên</Form.Label>
              <Form.Control
                value={formData.fullName || ""}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>SĐT</Form.Label>
              <Form.Control
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Văn phòng</Form.Label>
              <Form.Control
                value={formData.office || ""}
                onChange={(e) => setFormData({ ...formData, office: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={handleSave}>Lưu</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}