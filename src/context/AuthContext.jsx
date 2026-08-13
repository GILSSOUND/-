import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';


axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    checkUserLoggedIn();
    
    // Listen for cross-window messages (for popup social logins)
    const handleMessage = (event) => {
      // Security check: ensure origin matches expected
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'SOCIAL_LOGIN_SUCCESS') {
        setUser(event.data.user);
        setShowLoginModal(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const { data } = await axios.get(`/api/auth/me`);
      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`/api/auth/login`, { email, password });
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || '로그인 실패' };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await axios.post(`/api/auth/register`, userData);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || '회원가입 실패' };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`/api/auth/logout`);
      setUser(null);
      alert('성공적으로 로그아웃 되었습니다.');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const requireAuth = (action) => {
    if (user) {
      action();
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      loading,
      login,
      register,
      logout,
      requireAuth,
      showLoginModal,
      setShowLoginModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};
