import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = 'http://localhost:8000/api/v1';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => 
    localStorage.getItem('access_token')
  );

  const login = (newToken: string) => {
    localStorage.setItem('access_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      isAuthenticated: !!token, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthenticatedFetch = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE}${url}`, { ...options, headers });
    
    if (response.status === 401) {
      logout();
      navigate('/auth');
      throw new Error('Unauthorized');
    }

    return response;
  };

  return authFetch;
};

export { API_BASE };
