import axios from "../../../shared/services/axios";

/**
 * Lấy danh sách tất cả lịch sử thanh toán (Chỉ Admin)
 */
export const fetchPaymentsAPI = () => {
  return axios.get("/api/sepay/admin/payments");
};

/**
 * Thống kê doanh thu theo ngày, tháng, năm (Chỉ Admin)
 */
export const fetchRevenueAPI = () => {
  return axios.get("/api/sepay/admin/revenue");
};
