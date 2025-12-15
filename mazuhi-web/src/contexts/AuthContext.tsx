'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id?: string;
  nombre: string;
  telefono: string;
  correo: string;
  fechaNacimiento?: string; // formato: DD/MM
  email_verificado?: number; // 0 o 1 (SQLite boolean)
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  register: (userData: User) => Promise<void>;
  login: (userData: User) => Promise<void>;
  logout: () => void;
  checkUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si existe usuario al cargar
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const stored = localStorage.getItem('mazuhi_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: User) => {
    try {
      // Guardar usuario en localStorage
      localStorage.setItem('mazuhi_user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  };

  const login = async (userData: User) => {
    try {
      // Guardar usuario en localStorage
      localStorage.setItem('mazuhi_user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('mazuhi_user');
    setUser(null);
    // Redirigir a inicio
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, logout, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
