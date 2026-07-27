import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { initializing, isAuthenticated } = useAuth();

  if (initializing) {
    return <div className="route-loading">Cargando sesion...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/acceder" replace state={{ from: location }} />;
  }

  return children;
}
