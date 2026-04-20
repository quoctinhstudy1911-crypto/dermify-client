import { useEffect, useState, useCallback } from "react";
import { Badge, Button, Card, Container, Spinner, Table, Form, Modal } from "react-bootstrap";
import { Plus, Edit, Trash2, Lock, RefreshCw, UserCircle } from "lucide-react";
import staffApi from "@/api/staffApi";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function TaiKhoanAdmin() {
  // Lấy thông tin admin đang đăng nhập từ Context
  const { role, admin: currentAdmin } = useAdminAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);

  // States quản lý Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [editingStaff, setEditingStaff] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: "", phone: "" });
  const [addFormData, setAddFormData] = useState({ 
    email: "", 
    password: "", 
    name: "", 
    phone: "", 
    role: "staff" 
  });

  /**
   * Lấy danh sách nhân sự từ API
   */
  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const res = await staffApi.getAllStaff();
      // Bóc tách dữ liệu linh hoạt từ axios response
      const items = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
      
      // Nghiệm vụ: Lọc bỏ Super Admin khỏi danh sách hiển thị
      const filtered = items.filter(item => item.accountId?.role !== "super_admin");
      setStaff(filtered);
    } catch (error) {
      console.error("Lỗi tải danh sách nhân sự:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  /**
   * Xử lý tạo mới tài khoản (Staff hoặc Admin)
   */
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Kiểm tra định dạng số điện thoại trước khi gửi (Tránh lỗi 400 Invalid Phone)
      if (!/^\d{10}$/.test(addFormData.phone)) {
        alert("Số điện thoại phải có đúng 10 chữ số!");
        setLoading(false);
        return;
      }

      if (addFormData.role === "admin") {
        await staffApi.createAdmin({
          email: addFormData.email,
          password: addFormData.password,
          name: addFormData.name,
          phone: addFormData.phone
        });
      } else {
        await staffApi.createStaff({
          ...addFormData,
          position: "staff" 
        });
      }
      
      alert("Tạo tài khoản thành công!");
      setShowAddModal(false);
      setAddFormData({ email: "", password: "", name: "", phone: "", role: "staff" });
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi: Không thể tạo tài khoản");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mở modal sửa thông tin
   */
  const handleEditClick = (item) => {
    // So sánh ID tài khoản (accountId) để nhận diện bản thân
    const targetAccId = item.accountId?._id || item.accountId;
    const myAccId = currentAdmin?.accountId?._id || currentAdmin?.id;

    if (targetAccId === myAccId) {
      alert("Bạn không thể tự sửa quyền hạn của mình tại đây. Hãy vào trang cá nhân.");
      return;
    }
    setEditingStaff(item);
    setEditFormData({ name: item.name || "", phone: item.phone || "" });
    setShowEditModal(true);
  };

  /**
   * Lưu thông tin cập nhật
   */
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const staffId = editingStaff._id || editingStaff.id;
      await staffApi.updateStaff(staffId, { 
        name: editFormData.name, 
        phone: editFormData.phone 
      });
      setShowEditModal(false);
      fetchStaff();
      alert("Cập nhật thành công!");
    } catch (err) {
      alert(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Vô hiệu hóa nhân sự
   */
  const handleDisableStaff = async (user) => {
    const targetAccId = user.accountId?._id || user.accountId;
    const myAccId = currentAdmin?.accountId?._id || currentAdmin?.id;

    if (targetAccId === myAccId) {
      alert("Hệ thống bảo vệ: Bạn không thể tự vô hiệu hóa chính mình!");
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn vô hiệu hóa nhân sự [${user.name}]?`)) return;
    
    try {
      setLoading(true);
      await staffApi.deleteStaff(user._id || user.id);
      fetchStaff();
      alert("Đã vô hiệu hóa thành công.");
    } catch {
      alert("Có lỗi xảy ra khi thực hiện thao tác.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="p-4 bg-light min-vh-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">🛠️ Quản trị nội bộ</h2>
          <p className="text-muted small mb-0">Hệ thống quản lý vai trò và tài khoản nhân sự</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="white" className="border shadow-sm" onClick={fetchStaff} disabled={loading}>
            <RefreshCw size={18} className={loading ? "spin-animation" : ""} />
          </Button>
          <Button variant="primary" className="fw-bold px-3 border-0 shadow-sm"
            style={{ backgroundColor: "#4318FF" }} 
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={18} className="me-1" /> Thêm mới
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "15px" }}>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light text-uppercase small fw-bold">
                <tr>
                  <th className="ps-4 py-3">Nhân sự</th>
                  <th>Vai trò</th>
                  <th className="text-end pe-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading && staff.length === 0 ? (
                  <tr><td colSpan="3" className="text-center py-5"><Spinner animation="border" variant="primary" size="sm" /></td></tr>
                ) : (
                  staff.map((item) => {
                    const targetAccId = item.accountId?._id || item.accountId;
                    const myAccId = currentAdmin?.accountId?._id || currentAdmin?.id;
                    const isMe = targetAccId === myAccId;
                    const sRole = item.accountId?.role || "staff";

                    return (
                      <tr key={item._id || item.id} className="border-top">
                        <td className="ps-4 py-3">
                          <div className="fw-bold text-dark">
                            {item.name}
                            {isMe && <Badge bg="success" className="ms-2 fw-normal" style={{ fontSize: '10px' }}>LÀ BẠN</Badge>}
                          </div>
                          <div className="small text-muted">{item.accountId?.email}</div>
                        </td>
                        <td>
                          <Badge bg={sRole === "admin" ? "danger" : "info"}>{sRole.toUpperCase()}</Badge>
                        </td>
                        <td className="text-end pe-4">
                          <Button variant="link" className="p-1 text-primary shadow-none me-2" onClick={() => handleEditClick(item)}>
                            <Edit size={16} />
                          </Button>
                          {!isMe ? (
                            <Button variant="link" className="p-1 text-danger shadow-none" onClick={() => handleDisableStaff(item)}>
                              <Trash2 size={16} />
                            </Button>
                          ) : (
                            <span className="text-muted small px-2"><Lock size={14} className="me-1" />Khóa</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* --- MODAL THÊM MỚI --- */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Form onSubmit={handleAddSubmit}>
          <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Tạo tài khoản</Modal.Title></Modal.Header>
          <Modal.Body className="px-4">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Loại tài khoản</Form.Label>
              <Form.Select value={addFormData.role} onChange={(e) => setAddFormData({...addFormData, role: e.target.value})}>
                <option value="staff">Nhân sự thường (Staff)</option>
                {role === "super_admin" && <option value="admin">Quản trị viên (Admin)</option>}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Email</Form.Label>
              <Form.Control type="email" required onChange={(e) => setAddFormData({...addFormData, email: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Mật khẩu</Form.Label>
              <Form.Control type="password" required onChange={(e) => setAddFormData({...addFormData, password: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Họ tên</Form.Label>
              <Form.Control required onChange={(e) => setAddFormData({...addFormData, name: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Số điện thoại (10 số)</Form.Label>
              <Form.Control required placeholder="09xxxxxxxx" onChange={(e) => setAddFormData({...addFormData, phone: e.target.value})} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="light" onClick={() => setShowAddModal(false)}>Hủy</Button>
            <Button type="submit" variant="primary" style={{ backgroundColor: "#4318FF" }} disabled={loading}>Xác nhận</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* --- MODAL SỬA --- */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Form onSubmit={handleSaveEdit}>
          <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Sửa thông tin</Modal.Title></Modal.Header>
          <Modal.Body className="px-4">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Họ và tên</Form.Label>
              <Form.Control required value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Số điện thoại</Form.Label>
              <Form.Control required value={editFormData.phone} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="light" onClick={() => setShowEditModal(false)}>Hủy</Button>
            <Button type="submit" variant="primary" style={{ backgroundColor: "#4318FF" }} disabled={loading}>Lưu thay đổi</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <style>{`
        .spin-animation { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Container>
  );
}