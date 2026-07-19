import { CheckCircle2, LogIn, Star } from "lucide-react";
import { AppRoute } from "../../app/App";
import { FooterBar } from "../../shared/components/FooterBar";
import { MarketplaceHeader } from "../../shared/components/MarketplaceHeader";

type Props = {
  onNavigate: (route: AppRoute) => void;
};

export function BudgetsPage({ onNavigate }: Props) {
  return (
    <main className="marketplace-shell">
      <MarketplaceHeader active="budgets" onNavigate={onNavigate} />
      <section className="empty-session">
        <div className="session-card">
          <div className="session-icon"><LogIn size={42} /></div>
          <h1>Ups! Parece que no estas conectado</h1>
          <p>Inicia sesion para acceder a esta seccion y gestionar tus presupuestos</p>
          <button className="primary-wide" onClick={() => onNavigate("login")}><LogIn size={22} /> Iniciar sesion</button>
          <div className="benefits">
            <strong><Star size={18} /> Con tu cuenta podras:</strong>
            <div className="benefit-row">
              <CheckCircle2 size={26} />
              <span>Ver todos tus presupuestos y consultar solicitudes anteriores.</span>
            </div>
          </div>
        </div>
      </section>
      <FooterBar />
    </main>
  );
}
