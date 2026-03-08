import axios from "../../../shared/services/axios";

export const fetchDronesAPI = () => {
  return axios.get("/api/drones");
};

export const createDroneAPI = (data) => {
  return axios.post("/api/drones", data);
};

export const getDroneDetailAPI = (id) => {
  return axios.get(`/api/drones/${id}`);
};

export const updateDroneAPI = (id, data) => {
  return axios.put(`/api/drones/${id}`, data);
};

export const deleteDroneAPI = (id) => {
  return axios.delete(`/api/drones/${id}`);
};
