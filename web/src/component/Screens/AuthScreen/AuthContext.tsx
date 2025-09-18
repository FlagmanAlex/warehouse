// src/component/screens/AuthScreen/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuthToken, getUser, logout } from '../../../utils/auth';
import type { IUser } from '@warehouse/interfaces';

interface User extends Omit<IUser, 'password'> {}

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const login = (token: string, userData: User) => {
    localStorage.setItem('@auth_token', token);
    localStorage.setItem('@user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const token = getAuthToken();
    const storedUser = getUser();

    if (token && storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout: handleLogout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};