import { ArrowRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "../../../shared/components/Logo";

export function NotFoundPage() {
  return (
    <main className="not-found-shell min-h-screen">
      <section className="not-found-card">
        <Logo compact />
        <span className="eyebrow"><Home size={16} /> FixGo</span>
        <h1>Pagina no encontrada</h1>
        <p>La ruta que buscas no existe o ya no esta disponible.</p>
        <Link className="primary-pill large" to="/">
          Volver al inicio <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}
