import axios from "../../../shared/services/axios";

export const fetchZonesAPI = (params = {}) => {
  return axios.get("/api/zones", { params });
};

export const createZoneAPI = (data) => {
  return axios.post("/api/zones", data);
};

export const getZoneDetailAPI = (id) => {
  return axios.get(`/api/zones/${id}`);
};

export const updateZoneAPI = (id, data) => {
  return axios.put(`/api/zones/${id}`, data);
};

export const deleteZoneAPI = (id) => {
  return axios.delete(`/api/zones/${id}`);
};

export const checkPointAPI = (lat, lng, altitude) => {
  return axios.post("/api/zones/check", { lat, lng, altitude });
};
