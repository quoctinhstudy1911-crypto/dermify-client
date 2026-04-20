import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Button, Badge, Form, InputGroup, Spinner, Modal } from "react-bootstrap";
import { Search, UserCheck, UserX, Trash2, Plus, Edit } from "lucide-react";
import userApi from "@/api/userApi";

export default function TaiKhoanUsers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await userApi.admin.getAllUsers();
      setCustomers(Array.isArray(res) ? res : res.users || res.data || []);
    } catch (err) {
      console.error("Lỗi load khách hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSelectItem = (id) => {
    setSelectedCustomers(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(u => u._id));
    }
  };

  const handleUpdateStatus = async (status) => {
    if (selectedCustomers.length === 0) return alert("Chọn ít nhất một khách hàng!");

    try {
      for (const id of selectedCustomers) {
        await userApi.admin.updateUserStatus(id, { status });
      }
      alert(`Cập nhật thành công: ${status}`);
      fetchCustomers();
      setSelectedCustomers([]);
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (selectedCustomers.length === 0) return alert("Chọn ít nhất một khách hàng!");
    if (!window.confirm("Xác nhận xóa?")) return;

    try {
      for (const id of selectedCustomers) {
        await userApi.admin.deleteUser(id);
      }
      alert("Xóa thành công!");
      fetchCustomers();
      setSelectedCustomers([]);
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
        await userApi.admin.updateUserStatus(editingUser._id, formData);
      } else {
        await userApi.admin.createUser(formData);
      }
      alert("Lưu thành công!");
      setShowModal(false);
      fetchCustomers();
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

  const filteredCustomers = customers.filter(c =>
    c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="mt-4 mb-4">
      <h2 className="mb-4 fw-bold">👥 Tài khoản khách hàng</h2>

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
                        checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Tên</th>
                    <th>Giới tính</th>
                    <th>Ngày sinh</th>
                    <th>SĐT</th>
                    <th>Địa chỉ</th>
                    <th>Trạng thái</th>
                    <th style={{ width: "100px" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer._id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedCustomers.includes(customer._id)}
                          onChange={() => handleSelectItem(customer._id)}
                        />
                      </td>
                      <td className="fw-semibold">{customer.fullName || "N/A"}</td>
                      <td>{customer.gender || "N/A"}</td>
                      <td>{customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString("vi-VN") : "N/A"}</td>
                      <td>{customer.phone || "N/A"}</td>
                      <td>{customer.address || "N/A"}</td>
                      <td>{renderStatusBadge(customer.status)}</td>
                      <td>
                        <Button variant="link" size="sm" onClick={() => handleEdit(customer)}>
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
              <Form.Label>Địa chỉ</Form.Label>
              <Form.Control
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Giới tính</Form.Label>
              <Form.Select
                value={formData.gender || ""}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option>--Chọn--</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ngày sinh</Form.Label>
              <Form.Control
                type="date"
                value={formData.dateOfBirth ? formData.dateOfBirth.split("T")[0] : ""}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
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