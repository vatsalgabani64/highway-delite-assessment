import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_API_BASE_URL || "http://localhost:5000/api",
});

api.interceptors.request.use(config=>{
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if(token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;