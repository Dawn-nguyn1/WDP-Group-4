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

export  {registerUserAPI, loginUserAPI};