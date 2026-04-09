import axios from "../../../shared/services/axios";

export const startSimulationAPI = (missionId, options) => {
  return axios.post(`/api/simulations/missions/${missionId}/start`, options);
};

export const stopSimulationAPI = (runId) => {
  return axios.post(`/api/simulations/${runId}/stop`);
};

export const getSimulationStatusAPI = (runId) => {
  return axios.get(`/api/simulations/${runId}/status`);
};
