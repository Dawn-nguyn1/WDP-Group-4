import axios from "../../../shared/services/axios";

export const fetchDronesAPI = () => {
  return axios.get("/api/drones");
};

export const createDroneAPI = (data) => {
  return axios.post("/api/drones", data);
};

export const getDroneDetailAPI = (id) => {
  console.log('=== DRONE API CALL ===');
  console.log('Calling GET /api/drones/' + id);
  
  const result = axios.get(`/api/drones/${id}`);
  
  console.log('API call initiated:', result);
  console.log('=== END DRONE API CALL ===');
  
  return result;
};

export const updateDroneAPI = (id, data) => {
  return axios.put(`/api/drones/${id}`, data);
};

export const deleteDroneAPI = (id) => {
  return axios.delete(`/api/drones/${id}`);
};
