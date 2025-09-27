import axios from "axios";

// Instância configurada do axios
const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para requests (adicionar headers, auth, etc.)
api.interceptors.request.use(
  (config) => {
    // Adiciona timestamp para debug

    // Se tiveres token de autenticação, adiciona aqui:
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

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
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
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
