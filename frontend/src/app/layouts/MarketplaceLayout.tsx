import { Outlet } from "react-router-dom";
import { FooterBar } from "../../shared/components/FooterBar";
import { MarketplaceHeader } from "../../shared/components/MarketplaceHeader";

export function MarketplaceLayout() {
  return (
    <main className="marketplace-shell">
      <MarketplaceHeader />
      <Outlet />
      <FooterBar />
    </main>
  );
}
