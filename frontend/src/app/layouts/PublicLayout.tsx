import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../modules/auth";
import { PublicHeader } from "../../shared/components/PublicHeader";

export function PublicLayout() {
  const { pathname } = useLocation();
  const { isAuthenticated, logout, user, hasRole } = useAuth();
  const accountName = user?.firstName || "Mi cuenta";
  const isAdmin = hasRole("ADMIN");

  if (pathname === "/") {
    return (
      <main className="landing-shell">
        <PublicHeader accountName={accountName} isAuthenticated={isAuthenticated} isAdmin={isAdmin} onLogout={logout} />
        <Outlet />
      </main>
    );
  }

  return (
    <main className="public-route-shell">
      <Outlet />
    </main>
  );
}
