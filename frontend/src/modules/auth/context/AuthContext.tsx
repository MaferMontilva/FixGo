import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { setAccessTokenProvider } from "../../../shared/http/httpClient";
import { getCurrentUser, login as loginRequest, logout as logoutRequest, refreshSession, registerClient } from "../api/authApi";
import { clearStoredRefreshToken, getStoredRefreshToken, storeRefreshToken } from "../storage/authStorage";
import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from "../types/auth";

type AuthStatus = "initializing" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  initializing: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>("initializing");
  const [user, setUser] = useState<AuthUser | null>(null);
  const accessTokenRef = useRef<string | null>(null);

  const applyAuthResponse = useCallback(async (response: AuthResponse) => {
    accessTokenRef.current = response.accessToken;
    storeRefreshToken(response.refreshToken);
    setUser(response.user);
    setStatus("authenticated");
  }, []);

  const clearSession = useCallback(() => {
    accessTokenRef.current = null;
    clearStoredRefreshToken();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    setAccessTokenProvider(() => accessTokenRef.current);
    return () => setAccessTokenProvider(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const storedRefreshToken = getStoredRefreshToken();

      if (!storedRefreshToken) {
        if (!cancelled) setStatus("unauthenticated");
        return;
      }

      try {
        const refreshed = await refreshSession(storedRefreshToken);
        accessTokenRef.current = refreshed.accessToken;
        storeRefreshToken(refreshed.refreshToken);
        const currentUser = await getCurrentUser();

        if (!cancelled) {
          setUser(currentUser);
          setStatus("authenticated");
        }
      } catch {
        if (!cancelled) clearSession();
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      await applyAuthResponse(await loginRequest(payload));
    },
    [applyAuthResponse]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await applyAuthResponse(await registerClient(payload));
    },
    [applyAuthResponse]
  );

  const logout = useCallback(async () => {
    const storedRefreshToken = getStoredRefreshToken();

    if (storedRefreshToken && accessTokenRef.current) {
      await logoutRequest(storedRefreshToken).catch(() => undefined);
    }

    clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      initializing: status === "initializing",
      isAuthenticated: status === "authenticated",
      user,
      login,
      register,
      logout,
      hasRole: (role: string) => Boolean(user?.roles.includes(role as never))
    }),
    [login, logout, register, status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
