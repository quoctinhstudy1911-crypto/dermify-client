import axiosClient from "./axiosClient";

const orderApi = {
  // ==========================================
  // 1. DÀNH CHO KHÁCH HÀNG (CUSTOMER)
  // ==========================================
  customer: {
  // Tạo đơn hàng mới
    createOrder: (data) => axiosClient.post("/orders", data),

  // Lấy danh sách đơn hàng của khách hàng hiện tại
    getMyOrders: (params) => axiosClient.get("/orders", { params }),

  // Lấy chi tiết đơn hàng 
    getOrderDetail: (orderId) => axiosClient.get(`/orders/${orderId}`),

  // Hủy đơn hàng (nếu chưa được xác nhận)
    cancelOrder: (orderId, data) => 
      axiosClient.put(`/orders/${orderId}/cancel`, data),
  },

  // ==========================================
  // 2. DÀNH CHO QUẢN TRỊ VIÊN (ADMIN/STAFF)
  // ==========================================
  admin: {
    // Lấy danh sách tất cả đơn hàng với phân trang, lọc theo trạng thái, ngày tháng
    getAllOrders: (params) => axiosClient.get("/orders/admin/orders", { params }),

    // Lấy chi tiết đơn hàng cho admin
    getOrderDetail: (orderId) => axiosClient.get(`/orders/admin/orders/${orderId}`),

    // Lấy chi tiết và cập nhật trạng thái/thanh toán admin sử dụng các API hiện có
    updateStatus: (orderId, data) => 
      axiosClient.put(`/orders/admin/orders/${orderId}/status`, data),

    // Cập nhật thông tin thanh toán của đơn hàng (ví dụ: đã thanh toán, phương thức thanh toán)
    updatePayment: (orderId, data) => 
      axiosClient.put(`/orders/admin/orders/${orderId}/payment`, data),
    
    // Thống kê doanh thu, số lượng đơn hàng theo ngày, tháng, năm
    getStatistics: (params) => axiosClient.get("/orders/admin/orders/statistics", { params }),
  },
};

export default orderApi;