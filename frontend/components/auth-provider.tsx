"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthUser } from "../types";

type AuthState = {
  token: string;
  user: AuthUser;
};

type AuthContextValue = {
  auth: AuthState | null;
  isReady: boolean;
  setAuthState: (next: AuthState) => void;
  clearAuthState: () => void;
};

const AUTH_STORAGE_KEY = "jobfinder_auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthState;
        if (parsed?.token && parsed?.user?.role) {
          setAuth(parsed);
        }
      }
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  function setAuthState(next: AuthState) {
    setAuth(next);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
  }

  function clearAuthState() {
    setAuth(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  const value = useMemo(
    () => ({ auth, isReady, setAuthState, clearAuthState }),
    [auth, isReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
