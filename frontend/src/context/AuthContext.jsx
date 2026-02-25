import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

const TOKEN_KEY = 'mf_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  // On mount (or token change), try to fetch current user
  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    authApi
      .getMe(token)
      .then((u) => {
        if (u) {
          setUser(u);
        } else {
          // Token invalid — clear it
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const signup = useCallback(async ({ name, email, password, passwordConfirm }) => {
    const res = await authApi.signup({ name, email, password, passwordConfirm });
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if backend logout fails, clear local state
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
