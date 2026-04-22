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
      // Demo mode: ?demo=1 in URL → fake user for screencast recording
      // No network call, no auth needed. Used by video/recorder/.
      if (
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("demo") === "1"
      ) {
        setUser({
          id: "00000000-0000-0000-0000-000000000099",
          organization_id: "00000000-0000-0000-0000-000000000002",
          email: "demo@dana.by",
          name: "Дмитрий (Дана Холдинг)",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as UserResponse);
        setLoading(false);
        return;
      }

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
