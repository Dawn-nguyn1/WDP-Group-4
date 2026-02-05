import axios from "./axios.customize.js";
const registerUserAPI = (fullName, email, password, phone) => {
    
    const URL_BACKEND = "/api/auth/register";
    const data = {
        fullName: fullName,
        email: email,
        password: password,
    }
    return axios.post(URL_BACKEND, data);
};

const loginUserAPI = ( email, password) => {
    
    const URL_BACKEND = "/api/auth/login";
    const data = {
        email: email,
        password: password,
        delay:2000,
    }
    return axios.post(URL_BACKEND, data);
};

const createUserAPI = (fullName, email, password, role, status) => {
    
    const URL_BACKEND = "/api/admin/users";
    const data = {
        fullName: fullName,
        email: email,
        password: password,
        role: role,
        status: status
    }
    return axios.post(URL_BACKEND, data);
};

const fetchUsersAPI = () => {
    const URL_BACKEND = "/api/admin/users";
    return axios.get(URL_BACKEND);
};

const updateUserAPI = (id, email, password, fullName, role, status) => {
    const URL_BACKEND = `/api/admin/users/${id}`;
    const data = {
        email: email,
        password: password,
        fullName: fullName,
        role: role,
        status: status
    }
    return axios.put(URL_BACKEND, data);
};

const deleteUserAPI = (id) => {
    const URL_BACKEND = `/api/admin/users/${id}`;
    return axios.delete(URL_BACKEND);
};

const getUserDetailAPI = (id) => {
    const URL_BACKEND = `/api/admin/users/${id}`;
    return axios.get(URL_BACKEND);
};

const handleUploadFile = (file, folder) => {
    const URL_BACKEND = "/api/v1/file/upload";
    const data = new FormData();
    data.append("file", file);
    data.append("folder", folder);
    return axios.post(URL_BACKEND, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

const updateUserAvatarAPI = (avatar, id, fullName, phone) => {
    const URL_BACKEND = `/api/admin/users/${id}`;
    const data = {
        avatar: avatar,
        fullName: fullName,
        phone: phone
    }
    return axios.put(URL_BACKEND, data);
};

const getAccountAPI = () => {
    const URL_BACKEND = ``;
    return axios.get(URL_BACKEND);
};
const logoutAPI = () => {
    const URL_BACKEND = `/api/auth/logout`;
    return axios.post(URL_BACKEND);
};

const fetchZonesAPI = (params = {}) => {
    const URL_BACKEND = "/api/zones";
    return axios.get(URL_BACKEND, { params });
};

const createZoneAPI = (zoneData) => {
    const URL_BACKEND = "/api/zones";
    return axios.post(URL_BACKEND, zoneData);
};

const deleteZoneAPI = (id) => {
    const URL_BACKEND = `/api/zones/${id}`;
    return axios.delete(URL_BACKEND);
};

export  {registerUserAPI, loginUserAPI, createUserAPI,
     fetchUsersAPI, updateUserAPI, deleteUserAPI, 
     getUserDetailAPI, handleUploadFile, updateUserAvatarAPI,
     getAccountAPI, logoutAPI, fetchZonesAPI, createZoneAPI, deleteZoneAPI};