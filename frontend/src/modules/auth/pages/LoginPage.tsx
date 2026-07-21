import { ArrowLeft, BriefcaseBusiness, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "../../../shared/components/Logo";

export function LoginPage() {
  return (
    <section className="login-shell">
      <div className="login-card">
        <Logo compact />
        <h1 className="login-title">Acceder a FixGo</h1>
        <p className="login-intro">Selecciona el tipo de acceso para continuar. La autenticacion real se integrara mas adelante.</p>
        <div className="role-access-list">
          <Link className="primary-wide role-access-button" to="/cliente/inicio">
            <UserRound size={22} />
            Acceder como cliente
          </Link>
          <Link className="primary-wide role-access-button" to="/profesional/inicio">
            <BriefcaseBusiness size={22} />
            Acceder como profesional
          </Link>
          <Link className="primary-wide role-access-button neutral" to="/acceder">
            <ShieldCheck size={22} />
            Acceder como administrador
          </Link>
        </div>
        <Link className="back-link" to="/"><ArrowLeft size={18} /> Volver al inicio</Link>
      </div>
    </section>
  );
}
