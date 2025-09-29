import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/v1";

// Configurar axios com base URL e interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
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

// ✅ INTERCEPTOR CORRIGIDO - SÓ FAZ LOGOUT EM CASOS ESPECÍFICOS
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // ✅ MUDANÇA: Só fazer logout automático se for um token inválido/expirado
    // E NÃO for um erro de login (que também dá 401)
    if (error.response?.status === 401) {
      const url = error.config?.url;
      const isLoginAttempt =
        url?.includes("/login") || url?.includes("/signup");

      // ❌ NÃO fazer logout se for tentativa de login
      if (!isLoginAttempt) {
        console.log("🚨 Token expired or invalid - logging out");
        authService.logout();
        // ❌ REMOVER O REDIRECT FORÇADO
        // window.location.href = "/";
      }
    }

    const errorMessage =
      error.response?.data?.message || error.message || "Something went wrong!";
    return Promise.reject(new Error(errorMessage));
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
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
