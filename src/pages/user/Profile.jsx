import { useEffect, useState } from "react";
import {
  Container, Card, Form, Button, Row, Col, Image, Spinner, ListGroup, Alert, Modal,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import userAPI from "../../api/userApi";

function Profile() {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profileForm, setProfileForm] = useState({
    name: "", phone: "", gender: "", dateOfBirth: "",
  });

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);

  const [addressForm, setAddressForm] = useState({
    fullName: "", phone: "", street: "", ward: "", district: "", city: "", isDefault: false,
  });

  const navigate = useNavigate();

  // 1. Lấy dữ liệu khi vào trang
  const fetchData = async () => {
    setLoading(true);
    try {
      // Lấy Profile
      try {
        const resProfile = await userAPI.getProfile();
        const userData = resProfile.data?.data || resProfile.data;
        if (userData) {
          setUser(userData);
          setProfileForm({
            name: userData.name || "",
            phone: userData.phone || "",
            gender: userData.gender || "",
            dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split("T")[0] : "",
          });
        }
      } catch (pErr) { console.error("Lỗi Profile:", pErr); }

      // Lấy Danh sách địa chỉ
      try {
        const resAddress = await userAPI.getAddresses();
        const addrList = resAddress.data?.data || resAddress.data || [];
        setAddresses(Array.isArray(addrList) ? addrList : []);
      } catch (aErr) { 
        console.error("Lỗi Address (Có thể do 404):", aErr);
        setAddresses([]); 
      }
    } catch (err) {
      setError("Có lỗi hệ thống khi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/dangnhap");
      return;
    }
    fetchData();
  }, [navigate]);

  // 2. Xử lý Profile
  const handleProfileChange = (e) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(""); setSuccess("");
    try {
      await userAPI.updateProfile(profileForm);
      setSuccess("Cập nhật thông tin thành công!");
      const res = await userAPI.getProfile();
      setUser(res.data?.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật thất bại!");
    } finally { setSaving(false); }
  };

  // 3. Xử lý Modal Địa chỉ
  const openAddModal = (e) => {
    if (e) e.preventDefault();
    setIsEditing(false);
    setCurrentAddress(null);
    
    // Đảm bảo addresses luôn là mảng để không lỗi .length
    const currentList = Array.isArray(addresses) ? addresses : [];
    
    setAddressForm({
      fullName: "", phone: "", street: "", ward: "", district: "", city: "",
      isDefault: currentList.length === 0, // Tự động tích mặc định nếu chưa có địa chỉ nào
    });
    setShowAddressModal(true);
  };

  const openEditModal = (addr) => {
    setIsEditing(true);
    setCurrentAddress(addr);
    setAddressForm({
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      street: addr.street || "",
      ward: addr.ward || "",
      district: addr.district || "",
      city: addr.city || "",
      isDefault: addr.isDefault || false,
    });
    setShowAddressModal(true);
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // 4. Lưu địa chỉ (Thêm/Sửa)
  const handleSaveAddress = async () => {
    setSaving(true);
    setError(""); setSuccess("");
    try {
      const addrId = currentAddress?._id || currentAddress?.id;
      if (isEditing && addrId) {
        await userAPI.updateAddress(addrId, addressForm);
        setSuccess("Cập nhật địa chỉ thành công!");
      } else {
        await userAPI.addAddress(addressForm);
        setSuccess("Thêm địa chỉ mới thành công!");
      }
      setShowAddressModal(false);
      const res = await userAPI.getAddresses();
      const newList = res.data?.data || res.data || [];
      setAddresses(Array.isArray(newList) ? newList : []);
    } catch (err) {
      setError(err.response?.data?.message || "Lưu địa chỉ thất bại!");
    } finally { setSaving(false); }
  };

  // 5. XỬ LÝ XÓA ĐỊA CHỈ
  const handleDeleteAddress = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này không?")) {
      setSaving(true);
      try {
        await userAPI.deleteAddress(id);
        setSuccess("Đã xóa địa chỉ!");
        setAddresses(prev => prev.filter(item => (item._id !== id && item.id !== id)));
      } catch (err) {
        setError("Không thể xóa địa chỉ này!");
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" color="#e60d76" /><p>Đang tải dữ liệu...</p></Container>;

  return (
    <Container className="mt-5 mb-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow border-0" style={{ borderRadius: "15px" }}>
            <Card.Body className="p-4">
              <h3 className="text-center mb-4 fw-bold" style={{ color: "#e60d76" }}>QUẢN LÝ TÀI KHOẢN</h3>

              {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}
              {success && <Alert variant="success" dismissible onClose={() => setSuccess("")}>{success}</Alert>}

              {/* PHẦN PROFILE */}
              <Form onSubmit={handleUpdateProfile}>
                <div className="text-center mb-4">
                  <Image
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`}
                    roundedCircle width={120} height={120} className="border border-3 shadow-sm"
                  />
                  <div className="mt-3 mx-auto" style={{ maxWidth: "250px" }}>
                    <Form.Control type="file" size="sm" accept="image/*" />
                  </div>
                </div>

                <Row>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold">Email</Form.Label><Form.Control value={user?.email || ""} disabled /></Form.Group></Col>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold">Họ tên</Form.Label><Form.Control name="name" value={profileForm.name} onChange={handleProfileChange} placeholder="Nhập họ tên" /></Form.Group></Col>
                </Row>
                <Row>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold">Số điện thoại</Form.Label><Form.Control name="phone" value={profileForm.phone} onChange={handleProfileChange} placeholder="Số điện thoại" /></Form.Group></Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Giới tính</Form.Label>
                      <Form.Select name="gender" value={profileForm.gender} onChange={handleProfileChange}>
                        <option value="">Chọn</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-4"><Form.Label className="fw-bold">Ngày sinh</Form.Label><Form.Control type="date" name="dateOfBirth" value={profileForm.dateOfBirth} onChange={handleProfileChange} /></Form.Group>
                
                <Button type="submit" variant="primary" className="w-100 mb-4 py-2 fw-bold" disabled={saving}>
                  {saving ? <Spinner size="sm" /> : "LƯU THÔNG TIN"}
                </Button>
              </Form>

              {/* PHẦN ĐỊA CHỈ */}
              <hr />
              <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                <h5 className="mb-0 fw-bold" style={{ color: "#e60d76" }}>📍 ĐỊA CHỈ NHẬN HÀNG</h5>
                <Button variant="success" size="sm" type="button" onClick={openAddModal}>
                  + Thêm địa chỉ mới
                </Button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-4 border rounded bg-light">
                   <p className="text-muted mb-0">Bạn chưa lưu địa chỉ nào.</p>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {addresses.map((addr) => (
                    <ListGroup.Item key={addr._id || addr.id} className="px-0 py-3 border-bottom d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold">{addr.fullName} <span className="fw-normal text-muted ms-2">| {addr.phone}</span></div>
                        <div className="text-secondary small mt-1">
                          {addr.street}, {addr.ward}, {addr.district}, {addr.city}
                        </div>
                        {addr.isDefault && <span className="badge bg-danger-subtle text-danger border border-danger mt-2">Mặc định</span>}
                      </div>
                      <div className="d-flex gap-2">
                        <Button variant="link" className="p-0 text-primary text-decoration-none small" onClick={() => openEditModal(addr)}>Sửa</Button>
                        <Button variant="link" className="p-0 text-danger text-decoration-none small" onClick={() => handleDeleteAddress(addr._id || addr.id)}>Xóa</Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* MODAL THÊM/SỬA ĐỊA CHỈ */}
      <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} centered backdrop="static">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-5 fw-bold">{isEditing ? "CẬP NHẬT ĐỊA CHỈ" : "THÊM ĐỊA CHỈ MỚI"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Họ và tên</Form.Label>
                        <Form.Control name="fullName" value={addressForm.fullName} onChange={handleAddressChange} placeholder="Tên người nhận" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Số điện thoại</Form.Label>
                        <Form.Control name="phone" value={addressForm.phone} onChange={handleAddressChange} placeholder="0xxx..." />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">Địa chỉ cụ thể (Số nhà, đường)</Form.Label>
                    <Form.Control name="street" value={addressForm.street} onChange={handleAddressChange} placeholder="VD: 123 Lý Tự Trọng" />
                </Form.Group>
                <Row>
                    <Col md={4}><Form.Group className="mb-3"><Form.Label className="small fw-bold">Phường/Xã</Form.Label><Form.Control name="ward" value={addressForm.ward} onChange={handleAddressChange} /></Form.Group></Col>
                    <Col md={4}><Form.Group className="mb-3"><Form.Label className="small fw-bold">Quận/Huyện</Form.Label><Form.Control name="district" value={addressForm.district} onChange={handleAddressChange} /></Form.Group></Col>
                    <Col md={4}><Form.Group className="mb-3"><Form.Label className="small fw-bold">Thành phố</Form.Label><Form.Control name="city" value={addressForm.city} onChange={handleAddressChange} /></Form.Group></Col>
                </Row>
                <Form.Group className="mb-3">
                    <Form.Check type="checkbox" name="isDefault" label="Đặt làm địa chỉ mặc định" checked={addressForm.isDefault} onChange={handleAddressChange} />
                </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowAddressModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={handleSaveAddress} disabled={saving} className="px-4">
            {saving ? "Đang lưu..." : "Lưu địa chỉ"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Profile;