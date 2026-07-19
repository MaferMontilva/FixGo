import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { AppRoute } from "../../app/App";
import { PublicHeader } from "../../shared/components/PublicHeader";

type LandingPageProps = {
  onNavigate: (route: AppRoute) => void;
};

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <main className="landing-shell">
      <PublicHeader onNavigate={onNavigate} />
      <section className="landing-hero">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={16} /> FixGo Home</span>
          <h1>Soluciones profesionales para tu hogar, con FixGo</h1>
          <p>
            Solicita servicios de reformas, instalaciones, reparaciones y mantenimiento con una experiencia simple,
            moderna y asistida por inteligencia artificial.
          </p>
          <div className="hero-actions">
            <button className="primary-pill large" onClick={() => onNavigate("request")}>
              Pide presupuesto <ArrowRight size={18} />
            </button>
            <button className="dark-pill" onClick={() => onNavigate("home")}>
              Entrar al marketplace <ArrowRight size={18} />
            </button>
          </div>
        </div>
        <div className="hero-media" aria-label="Vista de servicios FixGo">
          <div className="home-photo photo-main"></div>
          <div className="home-photo photo-secondary"></div>
          <div className="home-photo photo-small"></div>
          <div className="floating-review">
            <CheckCircle2 size={20} />
            <span>Solicitud revisada</span>
          </div>
        </div>
      </section>
    </main>
  );
}
