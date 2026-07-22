import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "../hooks/useAuth";

type RoleProtectedRouteProps = {
  children: ReactNode;
  roles: string[];
};

export function RoleProtectedRoute({ children, roles }: RoleProtectedRouteProps) {
  const { initializing, isAuthenticated, hasRole } = useAuth();

  if (!initializing && isAuthenticated && !roles.some((role) => hasRole(role))) {
    return <Navigate to="/" replace />;
  }

  return <ProtectedRoute>{children}</ProtectedRoute>;
}
