import axios from "../../../shared/services/axios";

export const fetchMissionsAPI = (params = {}) => {
  return axios.get("/api/missions", { params });
};

export const getMissionDetailAPI = (id) => {
  return axios.get(`/api/missions/${id}`);
};

export const createMissionAPI = (data) => {
  return axios.post("/api/missions", data);
};

export const updateMissionAPI = (id, data) => {
  return axios.put(`/api/missions/${id}`, data);
};

export const deleteMissionAPI = (id) => {
  return axios.delete(`/api/missions/${id}`);
};

export const assignMissionToDroneAPI = (missionId, droneId, scheduledTime) => {
  return axios.post(`/api/missions/${missionId}/assign`, {
    droneId,
    scheduledTime
  });
};

export const addFlightPlanToMissionAPI = (missionId, data) => {
  return axios.post(`/api/missions/${missionId}/plans`, data);
};

export const updateMissionPlanAPI = (missionId, missionPlanId, data) => {
  return axios.put(`/api/missions/${missionId}/plans/${missionPlanId}`, data);
};

export const startMissionAPI = (missionId) => {
  return axios.post(`/api/missions/${missionId}/start`);
};

export const deleteMissionWithPlansAPI = (missionId) => {
  return axios.delete(`/api/missions/${missionId}/start`);
};

export const deleteMissionPlanFromMissionAPI = (missionId, missionPlanId) => {
  return axios.delete(`/api/missions/${missionId}/plans/${missionPlanId}`);
};
