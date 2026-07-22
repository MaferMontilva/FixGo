import { Outlet } from "react-router-dom";
import { useAuth } from "../../modules/auth";
import { FooterBar } from "../../shared/components/FooterBar";
import { MarketplaceHeader } from "../../shared/components/MarketplaceHeader";

export function MarketplaceLayout() {
  const { isAuthenticated, logout, user } = useAuth();
  const accountName = user?.firstName || "Mi cuenta";
  const mobileAccountName = user?.firstName || "Mi cuenta";

  return (
    <main className="marketplace-shell">
      <MarketplaceHeader
        accountName={accountName}
        isAuthenticated={isAuthenticated}
        mobileAccountName={mobileAccountName}
        onLogout={logout}
      />
      <Outlet />
      <FooterBar />
    </main>
  );
}
