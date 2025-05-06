import axios from "axios";

const END_POINT = process.env.REACT_APP_END_POINT;

const axiosInstance = axios.create({
  baseURL: END_POINT,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 7200000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Interceptor - Request error:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
