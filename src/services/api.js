import axios from "axios";

const isProduction = process.env.NODE_ENV === "production";

let baseURL;
if (isProduction) {
  baseURL = "/api";
} else {
  baseURL = "http://8.215.100.141:5000/api";
}

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
