import { CheckCircle2, LogIn, Star } from "lucide-react";
import { Link } from "react-router-dom";

export function BudgetsPage() {
  return (
    <section className="empty-session">
      <div className="session-card">
        <div className="session-icon"><LogIn size={42} /></div>
        <h1>Ups! Parece que no estas conectado</h1>
        <p>Inicia sesion para acceder a esta seccion y gestionar tus presupuestos</p>
        <Link className="primary-wide" to="/acceder"><LogIn size={22} /> Iniciar sesion</Link>
        <div className="benefits">
          <strong><Star size={18} /> Con tu cuenta podras:</strong>
          <div className="benefit-row">
            <CheckCircle2 size={26} />
            <span>Ver todos tus presupuestos y consultar solicitudes anteriores.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
