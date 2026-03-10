import axios from "../../../shared/services/axios";

/**
 * Lấy danh sách Conflicts (dành cho Admin)
 */
export const fetchConflictsAPI = async (params) => {
  return await axios.get("/api/conflicts", { params });
};

/**
 * Lấy chi tiết Conflict
 */
export const getConflictDetailAPI = async (id) => {
  return await axios.get(`/api/conflicts/${id}`);
};

/**
 * Giải quyết Conflict
 * payload: { resolution: "APPROVED_WITH_CONDITIONS" | "MANUAL_REJECT", notes: string }
 */
export const resolveConflictAPI = async (id, payload) => {
  return await axios.post(`/api/conflicts/${id}/resolve`, payload);
};
