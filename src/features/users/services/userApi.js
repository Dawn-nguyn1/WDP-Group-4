import axios from "../../../shared/services/axios";

// Admin CRUD APIs
export const fetchUsersAPI = () => {
  return axios.get("/api/users");
};

export const createUserAPI = (data) => {
  return axios.post("/api/users", data);
};

export const getUserDetailAPI = (id) => {
  return axios.get(`/api/users/${id}`);
};

export const updateUserAPI = (id, data) => {
  return axios.put(`/api/users/${id}`, data);
};

export const patchUserAPI = (id, data) => {
  return axios.patch(`/api/users/${id}`, data);
};

export const deleteUserAPI = (id) => {
  return axios.delete(`/api/users/${id}`);
};

// --- Profile APIs (Current User) ---
export const getMyProfileAPI = () => {
  return axios.get("/api/users/me");
};

export const updateMyProfileAPI = (data) => {
  return axios.put("/api/users/me", data);
};

export const deleteMyAccountAPI = () => {
  return axios.delete("/api/users/me");
};
