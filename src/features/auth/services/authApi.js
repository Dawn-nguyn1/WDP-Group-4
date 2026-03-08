import axios from "../../../shared/services/axios";

export const loginAPI = (email, password) => {
  return axios.post("/api/auth/login", { email, password });
};

export const registerAPI = (fullName, email, password, role) => {
  return axios.post("/api/auth/register", { fullName, email, password, role });
};

export const logoutAPI = () => {
  return axios.post("/api/auth/logout");
};

export const getMyProfileAPI = () => {
  return axios.get("/api/users/me");
};

export const updateMyProfileAPI = (data) => {
  return axios.patch("/api/users/me", data);
};

export const deleteMyAccountAPI = () => {
  return axios.delete("/api/users/me");
};
