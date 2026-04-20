import { useEffect, useState } from "react";
import {
  Container, Card, Form, Button, Row, Col,
  Image, Spinner, ListGroup, Alert, Modal, Badge
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { userApi } from "@/api";
import { useAuthContext } from "@/context/AuthContext";

// Định nghĩa màu hồng thương hiệu Dermify
const DERMIFY_PINK = "#e60d76";

function Profile() {
  const navigate = useNavigate();
  const { user, loginSuccess, loading: authLoading } = useAuthContext();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name: "", phone: "", gender: "", dateOfBirth: "",
  });

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);

  const [addressForm, setAddressForm] = useState({
    fullName: "", phone: "", street: "", ward: "", district: "", city: "", isDefault: false,
  });
  
  // LOG CHI TIẾT JSON Ở ĐÂY
  console.log("Full User JSON từ Context:", JSON.stringify(user, null, 2));

  // ================= PREVIEW CLEAN =================
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  // ================= SYNC USER -> FORM =================
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        phone: user.phone || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
      });
    }
  }, [user]);

  // ================= FETCH ADDRESS =================
  const fetchAddresses = async () => {
    try {
      const res = await userApi.getAddresses();
      setAddresses(Array.isArray(res) ? res : []);
    } catch {
      setError("Không thể tải địa chỉ!");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/dangnhap");
      return;
    }
    fetchAddresses();
    setLoading(false);
  }, [navigate]);

  // ================= PROFILE ACTIONS =================
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(""); 
    setSuccess("");

    // --- BƯỚC VALIDATE MỚI THÊM ---
    if (!profileForm.name.trim()) {
      setError("Tên không được để trống");
      return;
    }

    if (!/^[0-9]{9,11}$/.test(profileForm.phone)) {
      setError("Số điện thoại không hợp lệ");
      return;
    }

    // --- BẮT ĐẦU CẬP NHẬT ---
    setSaving(true);
    try {
      const payload = { ...profileForm };
      if (!payload.gender) delete payload.gender;
      await userApi.updateProfile(payload);
      await loginSuccess(); 
      setSuccess("Thông tin cá nhân đã được cập nhật thành công!");
    } catch (err) {
      setError(err.message || "Cập nhật thất bại!");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    try {
      await userApi.uploadAvatar(file);
      await loginSuccess();
      setPreview(null);
      setSuccess("Ảnh đại diện mới đã được cập nhật!");
    } catch {
      setError("Tải ảnh lên thất bại!");
      setPreview(null);
    }
  };

  // ================= ADDRESS ACTIONS =================
  const openAddModal = () => {
    setIsEditing(false);
    setAddressForm({
      fullName: "", phone: "", street: "", ward: "", district: "", city: "",
      isDefault: addresses.length === 0,
    });
    setShowAddressModal(true);
  };

  const openEditModal = (addr) => {
    setIsEditing(true);
    setCurrentAddress(addr);
    setAddressForm(addr);
    setShowAddressModal(true);
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSaveAddress = async () => {
    // --- BƯỚC VALIDATE MỚI THÊM ---
    if (!addressForm.fullName.trim()) {
      setError("Tên người nhận không được để trống");
      return;
    }

    if (!/^[0-9]{9,11}$/.test(addressForm.phone)) {
      setError("Số điện thoại không hợp lệ");
      return;
    }

    if (!addressForm.street || !addressForm.ward || !addressForm.district || !addressForm.city) {
      setError("Vui lòng nhập đầy đủ địa chỉ");
      return;
    }

    // --- BẮT ĐẦU LƯU ---
    setSaving(true);
    setError(""); 
    try {
      const id = currentAddress?._id || currentAddress?.id;
      if (isEditing && id) {
        await userApi.updateAddress(id, addressForm);
      } else {
        await userApi.addAddress(addressForm);
      }
      await fetchAddresses();
      setShowAddressModal(false);
      setSuccess("Lưu địa chỉ thành công!");
    } catch {
      setError("Lỗi khi lưu địa chỉ!");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Xóa địa chỉ này?")) return;
    try {
      await userApi.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => (a._id !== id && a.id !== id)));
    } catch {
      setError("Không thể xóa!");
    }
  };

  // ================= SET DEFAULT ADDRESS =================
  const handleSetDefault = async (id) => {
    try {
      await userApi.setDefaultAddress(id);
      await fetchAddresses(); 
      setSuccess("Đã đặt làm địa chỉ mặc định!");
    } catch {
      setError("Không thể đặt mặc định!");
    }
  };

  // ================= UI =================
  if (loading || authLoading) {
    return (
      <Container className="text-center mt-5 py-5">
        <Spinner animation="border" style={{ color: DERMIFY_PINK }} />
        <p className="mt-2 text-muted">Đang tải hồ sơ Dermify...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5 mb-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="p-4 shadow-sm border-0" style={{ borderRadius: "15px" }}>
            <h3 className="text-center fw-bold mb-4" style={{ color: DERMIFY_PINK }}>HỒ SƠ CỦA TÔI</h3>

            {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess("")}>{success}</Alert>}

            <Row className="g-4">
              <Col md={5} className="text-center border-end pe-md-4">
                <div className="mb-4">
                  <Image
                    src={preview || user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                    roundedCircle width={150} height={150}
                    className="border border-4 shadow-sm object-fit-cover"
                    style={{ borderColor: "#fff" }}
                  />
                  <div className="mt-3 px-4">
                    <Form.Control type="file" size="sm" onChange={handleUploadAvatar} accept="image/*" />
                    <Form.Text className="text-muted">Định dạng: JPG, PNG. Tối đa 2MB</Form.Text>
                  </div>
                </div>
                <div className="bg-light p-3 rounded-3 text-start">
                  <small className="fw-bold text-muted d-block mb-1">Email tài khoản:</small>
                  <span className="text-dark">{user?.email}</span>
                </div>
              </Col>

              <Col md={7} className="ps-md-4">
                <Form onSubmit={handleUpdateProfile}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">Họ và tên</Form.Label>
                    <Form.Control name="name" value={profileForm.name} onChange={handleProfileChange} placeholder="Nhập họ tên đầy đủ" />
                  </Form.Group>

                  <Row>
                    <Col sm={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Số điện thoại</Form.Label>
                        <Form.Control name="phone" value={profileForm.phone} onChange={handleProfileChange} placeholder="Số điện thoại" />
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Giới tính</Form.Label>
                        <Form.Select name="gender" value={profileForm.gender} onChange={handleProfileChange}>
                          <option value="">Chọn giới tính</option>
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold">Ngày sinh</Form.Label>
                    <Form.Control type="date" name="dateOfBirth" value={profileForm.dateOfBirth} onChange={handleProfileChange} />
                  </Form.Group>

                  <Button type="submit" className="w-100 fw-bold border-0 py-2" style={{ backgroundColor: DERMIFY_PINK }} disabled={saving}>
                    {saving ? <Spinner size="sm" /> : "LƯU THAY ĐỔI"}
                  </Button>
                </Form>
              </Col>
            </Row>

            <hr className="my-5" />
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold m-0" style={{ color: "#333" }}>📍 SỔ ĐỊA CHỈ</h5>
              <Button size="sm" className="fw-bold" style={{ backgroundColor: DERMIFY_PINK, border: "none" }} onClick={openAddModal}>
                + Thêm địa chỉ mới
              </Button>
            </div>

            <ListGroup variant="flush">
              {addresses.length === 0 ? (
                <div className="text-center py-4 text-muted border rounded-3 bg-light">Bạn chưa có địa chỉ lưu sẵn.</div>
              ) : (
                addresses.map((addr) => (
                  <ListGroup.Item key={addr._id || addr.id} className="px-0 py-3 border-bottom d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold">
                        {addr.fullName} <span className="text-muted fw-normal ms-2">| {addr.phone}</span>
                        {addr.isDefault && (
                          <Badge bg="danger-subtle" className="ms-2 text-danger border border-danger fw-normal">
                            Mặc định
                          </Badge>
                        )}
                      </div>
                      <div className="small text-secondary mt-1">{addr.street}, {addr.ward}, {addr.district}, {addr.city}</div>
                      
                      {!addr.isDefault && (
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 text-success text-decoration-none mt-1 fw-bold"
                          style={{ fontSize: '0.8rem' }}
                          onClick={() => handleSetDefault(addr._id || addr.id)}
                        >
                          Đặt làm mặc định
                        </Button>
                      )}
                    </div>
                    
                    <div className="d-flex gap-3">
                      <Button variant="link" size="sm" className="p-0 text-decoration-none text-primary fw-bold" onClick={() => openEditModal(addr)}>Sửa</Button>
                      {!addr.isDefault && (
                        <Button variant="link" size="sm" className="p-0 text-decoration-none text-danger fw-bold" onClick={() => handleDeleteAddress(addr._id || addr.id)}>Xóa</Button>
                      )}
                    </div>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>

      <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5">THÔNG TIN ĐỊA CHỈ</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <Form>
            <Row className="g-3">
              <Col md={6}><Form.Control name="fullName" value={addressForm.fullName} onChange={handleAddressChange} placeholder="Tên người nhận" /></Col>
              <Col md={6}><Form.Control name="phone" value={addressForm.phone} onChange={handleAddressChange} placeholder="Số điện thoại" /></Col>
              <Col md={12}><Form.Control name="street" value={addressForm.street} onChange={handleAddressChange} placeholder="Địa chỉ chi tiết (Số nhà, tên đường...)" /></Col>
              <Col md={4}><Form.Control name="ward" value={addressForm.ward} onChange={handleAddressChange} placeholder="Phường/Xã" /></Col>
              <Col md={4}><Form.Control name="district" value={addressForm.district} onChange={handleAddressChange} placeholder="Quận/Huyện" /></Col>
              <Col md={4}><Form.Control name="city" value={addressForm.city} onChange={handleAddressChange} placeholder="Tỉnh/Thành phố" /></Col>
            </Row>
            <Form.Check type="checkbox" name="isDefault" label="Đặt làm địa chỉ mặc định" checked={addressForm.isDefault} onChange={handleAddressChange} className="mt-3 small" />
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" className="fw-bold" onClick={() => setShowAddressModal(false)}>Hủy</Button>
          <Button className="fw-bold" style={{ backgroundColor: DERMIFY_PINK, border: "none" }} onClick={handleSaveAddress} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu địa chỉ"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Profile;