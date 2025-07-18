// src/contexts/AuthContext.tsx
import { createContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  userId: number | null;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded: { sub: number, exp: number } = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
          setUserId(decoded.sub);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error("Invalid token", error);
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('authToken', token);
    const decoded: { sub: number } = jwtDecode(token);
    setIsAuthenticated(true);
    setUserId(decoded.sub);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUserId(null);
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
