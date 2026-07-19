import { AppRoute } from "../../app/App";
import { Logo } from "./Logo";

type PublicHeaderProps = {
  onNavigate: (route: AppRoute) => void;
};

export function PublicHeader({ onNavigate }: PublicHeaderProps) {
  return (
    <header className="public-header">
      <button className="brand-button" onClick={() => onNavigate("landing")} aria-label="Ir al inicio">
        <Logo compact />
      </button>
      <nav className="public-nav" aria-label="Navegacion publica">
        <button onClick={() => onNavigate("landing")}>Soy particular</button>
        <button onClick={() => onNavigate("professionals")}>Soy profesional</button>
        <button>Soporte empresas</button>
        <button>Tecnologia</button>
        <button onClick={() => onNavigate("login")}>Acceder</button>
      </nav>
      <button className="primary-pill" onClick={() => onNavigate("request")}>Pide presupuesto</button>
    </header>
  );
}
