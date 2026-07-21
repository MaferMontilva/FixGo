import { Outlet, useLocation } from "react-router-dom";
import { PublicHeader } from "../../shared/components/PublicHeader";

export function PublicLayout() {
  const { pathname } = useLocation();

  if (pathname === "/") {
    return (
      <main className="landing-shell">
        <PublicHeader />
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
