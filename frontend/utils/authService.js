import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Função para atualizar o token no header do axios
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("Token set in axios headers");
  } else {
    delete api.defaults.headers.common["Authorization"];
    console.log("Token removed from axios headers");
  }
};

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
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url;
      const isLoginAttempt =
        url?.includes("/login") || url?.includes("/signup");
      const isPasswordUpdate = url?.includes("/updateMyPassword");

      if (!isLoginAttempt && !isPasswordUpdate) {
        console.log("Token expired or invalid - logging out");
        authService.logout();
      }
    }

    const errorMessage =
      error.response?.data?.message || error.message || "Something went wrong!";
    const statusCode = error.response?.status;

    const customError = new Error(errorMessage);
    customError.statusCode = statusCode;
    customError.isAuthError = statusCode === 401;
    customError.isForbiddenError = statusCode === 403;
    customError.originalError = error;

    return Promise.reject(customError);
  },
);

export const authService = {
  login: async (email, password) => {
    try {
      const data = await api.post("/users/login", {
        email,
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      setAuthToken(data.token);

      return data;
    } catch (error) {
      throw error;
    }
  },

  signup: async (name, email, password, passwordConfirm) => {
    try {
      const data = await api.post("/users/signup", {
        name,
        email,
        password,
        passwordConfirm,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      setAuthToken(data.token);

      return data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post("/users/logout");
      console.log("Backend logout successful");
    } catch (error) {
      console.log("Backend logout failed, but continuing with local logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuthToken(null);
      console.log("LocalStorage cleared");
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isLoggedIn: () => {
    return !!localStorage.getItem("token");
  },

  refreshUser: async () => {
    try {
      const data = await api.get("/users/me");
      localStorage.setItem("user", JSON.stringify(data.data.user));
      return data.data.user;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (updateData) => {
    try {
      const data = await api.patch("/users/updateMe", updateData);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      return data;
    } catch (error) {
      throw error;
    }
  },

  updatePassword: async (passwordCurrent, password, passwordConfirm) => {
    try {
      const data = await api.patch("/users/updateMyPassword", {
        passwordCurrent,
        password,
        passwordConfirm,
      });

      localStorage.setItem("token", data.token);
      setAuthToken(data.token);
      return data;
    } catch (error) {
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const data = await api.post("/users/forgotPassword", { email });
      return data;
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (token, password, passwordConfirm) => {
    try {
      const data = await api.patch(`/users/resetPassword/${token}`, {
        password,
        passwordConfirm,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      setAuthToken(data.token);
      return data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;
