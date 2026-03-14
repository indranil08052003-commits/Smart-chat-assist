import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('smartchat_token');
    const stored = localStorage.getItem('smartchat_business');
    if (token && stored) {
      setBusiness(JSON.parse(stored));
      // Verify token
      api.get('/auth/me')
        .then(res => setBusiness(res.data.business))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('smartchat_token', res.data.token);
    localStorage.setItem('smartchat_business', JSON.stringify(res.data.business));
    setBusiness(res.data.business);
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('smartchat_token', res.data.token);
    localStorage.setItem('smartchat_business', JSON.stringify(res.data.business));
    setBusiness(res.data.business);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('smartchat_token');
    localStorage.removeItem('smartchat_business');
    setBusiness(null);
  };

  const updateBusiness = (updatedBusiness) => {
    setBusiness(updatedBusiness);
    localStorage.setItem('smartchat_business', JSON.stringify(updatedBusiness));
  };

  return (
    <AuthContext.Provider value={{ business, login, register, logout, updateBusiness, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
