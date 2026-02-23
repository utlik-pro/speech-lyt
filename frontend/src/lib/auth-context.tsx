"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getCurrentUser,
  loginUser,
  registerUser,
  type UserResponse,
} from "@/lib/api";
import api from "@/lib/api";

interface AuthContextValue {
  user: UserResponse | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "speechlyt-token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Set up axios interceptor for auth header
  useEffect(() => {
    const interceptorId = api.interceptors.request.use((config) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    return () => {
      api.interceptors.request.eject(interceptorId);
    };
  }, []);

  // Load user on mount if token exists
  useEffect(() => {
    async function loadUser() {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem(TOKEN_KEY)
          : null;

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch {
        // Token expired or invalid
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginUser({ email, password });
    localStorage.setItem(TOKEN_KEY, result.access_token);
    setUser(result.user);
  }, []);

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const result = await registerUser({ email, password, name });
      localStorage.setItem(TOKEN_KEY, result.access_token);
      setUser(result.user);
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
