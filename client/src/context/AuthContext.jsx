import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/endpoints';
import { clearUserSpecificCache } from '../queryClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('playarena_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('playarena_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      const storedToken = localStorage.getItem('playarena_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('playarena_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Session verification failed, resetting auth state.');
          logout();
        }
      }
      setLoading(false);
    }
    verifyAuth();
  }, []);

  const login = async (email, password) => {
    // Proactively clear prior user's cached queries
    clearUserSpecificCache();

    const res = await authApi.login({ email, password });
    if (res.success && res.data) {
      const { user: loggedInUser, token: authToken } = res.data;
      localStorage.setItem('playarena_token', authToken);
      localStorage.setItem('playarena_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setToken(authToken);
      return loggedInUser;
    }
    throw new Error('Authentication response malformed');
  };

  const register = async (userData) => {
    clearUserSpecificCache();

    const res = await authApi.register(userData);
    if (res.success && res.data) {
      const { user: registeredUser, token: authToken } = res.data;
      localStorage.setItem('playarena_token', authToken);
      localStorage.setItem('playarena_user', JSON.stringify(registeredUser));
      setUser(registeredUser);
      setToken(authToken);
      return registeredUser;
    }
    throw new Error('Registration response malformed');
  };

  const logout = () => {
    clearUserSpecificCache();
    setUser(null);
    setToken(null);
    localStorage.removeItem('playarena_token');
    localStorage.removeItem('playarena_user');
  };

  const updateUser = (updatedUserData) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updatedUserData };
      localStorage.setItem('playarena_user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'ADMIN',
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
