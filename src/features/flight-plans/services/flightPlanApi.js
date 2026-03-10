import axios from "../../../shared/services/axios";

/**
 * Lấy danh sách Flight Plans
 */
export const fetchFlightPlansAPI = async (params) => {
  return await axios.get("/api/flight-plans", { params });
};

/**
 * Lấy chi tiết một Flight Plan
 */
export const getFlightPlanDetailAPI = async (id) => {
  return await axios.get(`/api/flight-plans/${id}`);
};

/**
 * Tạo mới Flight Plan (DRAFT)
 */
export const createFlightPlanAPI = async (data) => {
  return await axios.post("/api/flight-plans", data);
};

/**
 * Cập nhật Flight Plan (chỉ khi DRAFT hoặc REJECTED)
 */
export const updateFlightPlanAPI = async (id, data) => {
  return await axios.put(`/api/flight-plans/${id}`, data);
};

/**
 * Submit Flight Plan để kiểm tra xung đột và Approved/Rejected
 */
export const submitFlightPlanAPI = async (id) => {
  return await axios.post(`/api/flight-plans/${id}/submit`);
};

/**
 * Hủy Flight Plan
 */
export const cancelFlightPlanAPI = async (id) => {
  return await axios.post(`/api/flight-plans/${id}/cancel`);
};

/**
 * Xóa Flight Plan (chỉ DRAFT)
 */
export const deleteFlightPlanAPI = async (id) => {
  return await axios.delete(`/api/flight-plans/${id}`);
};
