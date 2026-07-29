import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <section className="landing-hero">
      <div className="hero-copy">
        <span className="eyebrow"><Sparkles size={16} /> FixGo Home</span>
        <h1>Soluciones profesionales para tu hogar, con FixGo</h1>
        <p>
          Reformas, instalaciones y reparaciones para tu hogar, con una experiencia simple y asistida por inteligencia artificial.
        </p>
        <div className="hero-actions">
          <Link className="primary-pill large" to="/cliente/solicitar-presupuesto">
            Pide presupuesto <ArrowRight size={18} />
          </Link>
          <Link className="hero-textlink" to="/cliente/inicio">
            Entrar al marketplace <ArrowRight size={18} />
          </Link>
        </div>
      </div>
      <div className="hero-media" aria-label="Vista de servicios FixGo">
        <div className="floating-review">
          <CheckCircle2 size={20} />
          <span>Solicitud revisada</span>
        </div>
      </div>
    </section>
  );
}
