import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../modules/auth";
import { PublicHeader } from "../../shared/components/PublicHeader";

export function PublicLayout() {
  const { pathname } = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const accountName = user?.firstName || "Mi cuenta";

  if (pathname === "/") {
    return (
      <main className="landing-shell">
        <PublicHeader accountName={accountName} isAuthenticated={isAuthenticated} onLogout={logout} />
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
