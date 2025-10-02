import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/v1";

// ✅ CONFIGURAR AXIOS PARA COOKIES
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ✅ ISTO ENVIA COOKIES AUTOMATICAMENTE!
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);


api.interceptors.response.use(
  (response) => response.data, //extrair os dados
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url;
      const isLoginAttempt =
        url?.includes("/login") || url?.includes("/signup");

      if (!isLoginAttempt) {
        console.log("🚨 Token expired or invalid - logging out");
        authService.logout();
      }
    }

    //  DETECTAR TIPO DE ERRO E CRIAR MENSAGEM ESPECÍFICA
    const errorMessage =
      error.response?.data?.message || error.message || "Something went wrong!";
    const statusCode = error.response?.status;

    // Criar erro customizado com mais informações
    const customError = new Error(errorMessage);
    customError.statusCode = statusCode;
    customError.isAuthError = statusCode === 401;
    customError.isForbiddenError = statusCode === 403;
    customError.originalError = error;

    return Promise.reject(customError);
  },
);

export const authService = {
  // Login
  login: async (email, password) => {
    try {
      const data = await api.post("/users/login", {
        email,
        password,
      });

      // Guardar token no localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Signup
  signup: async (name, email, password, passwordConfirm) => {
    try {
      const data = await api.post("/users/signup", {
        name,
        email,
        password,
        passwordConfirm,
      });

      // Guardar token no localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  // LOGOUT ATUALIZADO - limpa cookie + localStorage
  logout: async () => {
    try {
      // 1 Chamar backend para limpar cookie
      await api.post("/users/logout");
      console.log("✅ Backend logout successful");
    } catch (error) {
      console.log("⚠️ Backend logout failed, but continuing with local logout");
    } finally {
      // 2 SEMPRE limpar localStorage (mesmo se backend falhe)
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      console.log("✅ LocalStorage cleared");
    }
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Check if logged in
  isLoggedIn: () => {
    return !!localStorage.getItem("token");
  },

  // Refresh user data from server
  refreshUser: async () => {
    try {
      const data = await api.get("/users/me");
      localStorage.setItem("user", JSON.stringify(data.data.user));
      return data.data.user;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (updateData) => {
    try {
      const data = await api.patch("/users/updateMe", updateData);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  updatePassword: async (passwordCurrent, password, passwordConfirm) => {
    try {
      const data = await api.patch("/users/updateMyPassword", {
        passwordCurrent,
        password,
        passwordConfirm,
      });

      // Atualizar token
      localStorage.setItem("token", data.token);
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const data = await api.post("/users/forgotPassword", { email });
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, password, passwordConfirm) => {
    try {
      const data = await api.patch(`/users/resetPassword/${token}`, {
        password,
        passwordConfirm,
      });

      // Guardar novo token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      return data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;
