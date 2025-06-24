import axios from "axios";

const baseURL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "/api"
    : "http://localhost:5000/api");

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk handling error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response);

    if (error.response?.status === 404) {
      console.error("Endpoint not found:", error.config.url);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
