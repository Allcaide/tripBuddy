import axios from "axios";

// Use Vite env or empty string so requests are relative in production
const baseURL = import.meta.env.VITE_API_BASE_URL || "";

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para requests (adicionar headers, auth, etc.)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // ✅ Mude de 'jwt' para 'token'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("🚨 Request Error:", error);
    return Promise.reject(error);
  },
);
// Interceptor para responses (tratamento de erros global)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("🚨 API Error:", error.response?.data || error.message);

    // Tratamento global de erros
    if (error.response?.status === 401) {
      // Token expirado - redireciona para login
      console.warn("Token expired - redirect to login");
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default api;
