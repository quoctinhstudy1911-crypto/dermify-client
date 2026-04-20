import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Col, Container, Form, InputGroup, Row, Spinner, Table } from "react-bootstrap";
import { Search, Trash2, UserCheck, UserX } from "lucide-react";
import userApi from "@/api/userApi";

const normalizeCustomer = (item) => {
  const customer = item.customerInfo || {};
  return {
    id: item.id || item._id,
    email: item.email || "",
    role: item.role || "customer",
    status: item.status || "pending",
    name: customer.name || customer.fullName || item.fullName || item.name || "",
    phone: customer.phone || item.phone || "",
  };
};

export default function TaiKhoanUsers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await userApi.admin.getAllUsers({ role: "customer" });
      const items = Array.isArray(res) ? res : res?.users || res?.data || [];
      setCustomers(items.map(normalizeCustomer));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filteredCustomers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return customers;
    return customers.filter((item) =>
      item.name.toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword) ||
      item.phone.includes(keyword)
    );
  }, [customers, searchTerm]);

  const toggleOne = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredCustomers.length) { setSelectedIds([]); return; }
    setSelectedIds(filteredCustomers.map((item) => item.id));
  };

  const updateSelectedStatus = async (status) => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Xác nhận thay đổi trạng thái cho các tài khoản đã chọn?`)) return;
    try {
      await Promise.all(selectedIds.map((id) => userApi.admin.updateUserStatus(id, { status })));
      setSelectedIds([]);
      await fetchCustomers();
    } catch (err) { alert(err?.message || "Lỗi"); }
  };

  const deleteSelected = async () => {
    if (!selectedIds.length || !window.confirm(`Xóa vĩnh viễn các tài khoản đã chọn?`)) return;
    try {
      await Promise.all(selectedIds.map((id) => userApi.admin.deleteUser(id)));
      setSelectedIds([]);
      await fetchCustomers();
    } catch (err) { alert(err?.message || "Lỗi"); }
  };

  return (
    <Container fluid className="mt-4 mb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Quản lý Tài khoản Khách hàng</h2>
      </div>
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white py-3">
          <Row className="align-items-center g-3">
            <Col md={5}><InputGroup><InputGroup.Text><Search size={18} /></InputGroup.Text>
              <Form.Control placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </InputGroup></Col>
            <Col md={7} className="text-end">
              <Button variant="outline-success" size="sm" className="me-2" disabled={!selectedIds.length} onClick={() => updateSelectedStatus("active")}><UserCheck size={16}/> Mở khóa</Button>
              <Button variant="outline-warning" size="sm" className="me-2" disabled={!selectedIds.length} onClick={() => updateSelectedStatus("inactive")}><UserX size={16}/> Khóa</Button>
              <Button variant="outline-danger" size="sm" disabled={!selectedIds.length} onClick={deleteSelected}><Trash2 size={16}/> Xóa</Button>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th style={{ width: 50, paddingLeft: '1.5rem' }}><Form.Check checked={selectedIds.length === filteredCustomers.length && filteredCustomers.length > 0} onChange={toggleAll} /></th>
                  <th>Họ và tên</th><th>Email</th><th>Số điện thoại</th><th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={5} className="text-center py-5"><Spinner animation="border" /></td></tr> :
                  filteredCustomers.map((item) => (
                    <tr key={item.id}>
                      <td style={{ paddingLeft: '1.5rem' }}><Form.Check checked={selectedIds.includes(item.id)} onChange={() => toggleOne(item.id)} /></td>
                      <td className="fw-semibold">{item.name || "N/A"}</td><td>{item.email}</td><td>{item.phone || "N/A"}</td>
                      <td><Badge bg={item.status === "active" ? "success" : "danger"}>{item.status}</Badge></td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}