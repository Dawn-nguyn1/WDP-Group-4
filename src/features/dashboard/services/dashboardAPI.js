import axios from "../../../shared/services/axios";

/**
 * Lấy danh sách tất cả lịch sử thanh toán (Chỉ Admin)
 */
export const fetchPaymentsAPI = () => {
  return axios.get("/api/sepay/admin/payments");
};

/**
 * Thống kê doanh thu theo tháng, quý, năm (Chỉ Admin)
 * Endpoint: /api/admin/analytics/revenue
 */
export const fetchRevenueAPI = () => {
  return axios.get("/api/admin/analytics/revenue");
};

/**
 * Thống kê drone theo owner type (Chỉ Admin)
 * Endpoint: /api/admin/analytics/drones
 */
export const fetchDroneAnalyticsAPI = () => {
  return axios.get("/api/admin/analytics/drones");
};
