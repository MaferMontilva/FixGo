import { LogIn } from "lucide-react";
import { AppRoute } from "../../app/App";
import { Logo } from "./Logo";

type MarketplaceHeaderProps = {
  active: AppRoute;
  onNavigate: (route: AppRoute) => void;
};

const items: Array<{ label: string; route: AppRoute }> = [
  { label: "Inicio", route: "home" },
  { label: "Solicita presupuesto", route: "request" },
  { label: "Mis presupuestos", route: "budgets" },
  { label: "Profesionales", route: "professionals" }
];

export function MarketplaceHeader({ active, onNavigate }: MarketplaceHeaderProps) {
  return (
    <header className="marketplace-header">
      <button className="brand-button" onClick={() => onNavigate("landing")} aria-label="Ir a FixGo">
        <Logo compact />
      </button>
      <nav className="marketplace-nav" aria-label="Navegacion marketplace">
        {items.map((item) => (
          <button
            key={item.route}
            className={active === item.route ? "active" : ""}
            onClick={() => onNavigate(item.route)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="header-actions">
        <button className="language-button">🇪🇸</button>
        <button className="login-link" onClick={() => onNavigate("login")}>
          <LogIn size={22} />
          Iniciar sesion
        </button>
      </div>
    </header>
  );
}
