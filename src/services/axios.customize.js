// noi cau hinh interceptor
import axios from "axios";

// Set config defaults when creating the instance
const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL
});

// Alter defaults after instance has been created
// instance.defaults.headers.common['Authorization'] = AUTH_TOKEN;

// Add a request interceptor
instance.interceptors.request.use(function (config) {
    if (typeof window !== "undefined" && window && window.localStorage //neu co dong nay thi lay ra dong duoi
       && window.localStorage.getItem('access_token')) { //lay ra access_token đã set ở login để gắn header
        config.headers.Authorization = 'Bearer ' + window.localStorage.getItem('access_token');
    }
    // Do something before request is sent
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});


// Add a response interceptor
instance.interceptors.response.use(function (response) { // noi tra ve respone
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
        console.log("RESPONSE SAU MOI HANH DONG:", response);

    // Smart check: ưu tiên user object, fallback to data
    if(response.data && response.data.user) {
        // APIs có structure: { "user": {...} }
        return response.data;  // Trả về user object trực tiếp
    } else if(response.data && response.data.data && response.data.data.user) {
        // APIs có structure: { "data": { "user": {...} } }
        return response.data.data;  // Trả về data object chứa user
    } else if(response.user) {
        // APIs có structure: { "user": {...}, "token": "..." } (login)
        return response;
    } else if(response.data && response.data._id) {
        // APIs có structure: { "_id": "...", "email": "...", ... } (user detail)
        return response.data;  // Trả về user object trực tiếp
    } else if(response.data) {
        // APIs có structure: { "data": {...} }
        return response.data;
    }
    
    return response; 
  }, function (error) {
    console.log("RESPONSE SAU MOI HANH DONG ERROR:", error);
    // Any status codes that falls outside of range of 2xx cause this function to trigger
    // Do something with response error
    if (error.response && error.response.data) return Promise.reject(error.response.data);
    return Promise.reject(error);
  });
export default instance;