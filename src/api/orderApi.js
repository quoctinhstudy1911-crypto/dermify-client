import axiosClient from "./axiosClient";

const orderApi = {
  // ==========================================
  // 1. DÀNH CHO KHÁCH HÀNG (CUSTOMER)
  // ==========================================
  customer: {
    /**
     * Tạo đơn hàng mới từ giỏ hàng
     * @param {Object} data - { shippingAddress, paymentMethod, note }
     */
    createOrder: (data) => axiosClient.post("/orders", data),

    /**
     * Lấy danh sách đơn hàng cá nhân (có phân trang & filter)
     * @param {Object} params - { page, limit, status }
     */
    getMyOrders: (params) => axiosClient.get("/orders", { params }),

    /**
     * Xem chi tiết đơn hàng theo ID
     */
    getOrderDetail: (orderId) => axiosClient.get(`/orders/${orderId}`),

    /**
     * Khách hàng yêu cầu hủy đơn
     * @param {string} orderId 
     * @param {Object} data - { reason: "Lý do hủy" }
     */
    cancelOrder: (orderId, data) => 
      axiosClient.put(`/orders/${orderId}/cancel`, data),
  },

  // ==========================================
  // 2. DÀNH CHO QUẢN TRỊ VIÊN (ADMIN/STAFF)
  // ==========================================
  admin: {
    /**
     * Lấy tất cả đơn hàng toàn hệ thống
     * @param {Object} params - { page, limit, status, paymentStatus, search, fromDate, toDate }
     */
    getAllOrders: (params) => axiosClient.get("/orders/admin/orders", { params }),

    /**
     * Cập nhật trạng thái đơn hàng (Confirmed, Shipping, Delivered, Cancelled)
     * @param {string} orderId 
     * @param {Object} data - { status: "delivered" }
     */
    updateStatus: (orderId, data) => 
      axiosClient.put(`/orders/admin/orders/${orderId}/status`, data),

    /**
     * Cập nhật trạng thái thanh toán và thông tin giao dịch
     * @param {string} orderId 
     * @param {Object} data - { paymentStatus, transactionId, bankCode, payDate }
     */
    updatePayment: (orderId, data) => 
      axiosClient.put(`/orders/admin/orders/${orderId}/payment`, data),

    /**
     * Lấy dữ liệu thống kê doanh thu, đơn hàng
     * @param {Object} params - { startDate, endDate } (định dạng YYYY-MM-DD)
     */
    getStatistics: (params) => axiosClient.get("/orders/admin/orders/statistics", { params }),
  },
};

export default orderApi;