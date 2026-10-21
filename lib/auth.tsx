// ============================================================
// AUTH HOOK
// ============================================================
// Maneja el estado de autenticación del usuario.
// Guarda el token y los datos del usuario en localStorage.
// ============================================================
'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { apiFetch, setToken, removeToken, getToken } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'guest' | 'assistant' | 'admin' | 'auditor';
  passportNumber?: string;
  passportPhoto?: string;
  passportVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario al montar
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    apiFetch<User>('/users/me')
      .then((data) => setUser(data))
      .catch(() => {
        removeToken();
      })
      .finally(() => setLoading(false));
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    const response = await apiFetch<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setToken(response.token);

    // Cargar el usuario completo
    const fullUser = await apiFetch<User>('/users/me');
    setUser(fullUser);
  };

  // Logout
  const logout = () => {
    removeToken();
    setUser(null);
  };

  // Refrescar usuario
  const refresh = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const data = await apiFetch<User>('/users/me');
      setUser(data);
    } catch {
      removeToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}

export function getRedirectByRole(role: string): string {
  switch (role) {
    case 'assistant':
      return '/assistant';
    case 'admin':
      return '/admin';
    case 'auditor':
      return '/auditor';
    case 'guest':
    default:
      return '/account';
  }
}