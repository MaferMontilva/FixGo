import { LogIn, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";

const items = [
  { label: "Inicio", path: "/cliente/inicio" },
  { label: "Solicita presupuesto", path: "/cliente/solicitar-presupuesto" },
  { label: "Mis presupuestos", path: "/cliente/mis-presupuestos" },
  { label: "Profesionales", path: "/cliente/profesionales" }
];

export function MarketplaceHeader() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const goTo = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="marketplace-header">
      <button className="brand-button" onClick={() => goTo("/")} aria-label="Ir a FixGo">
        <Logo compact />
      </button>

      <button
        className="mobile-menu-button"
        type="button"
        aria-label={isMenuOpen ? "Cerrar menu" : "Abrir menu"}
        aria-controls="marketplace-header-menu"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((current) => !current)}
      >
        {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div className={isMenuOpen ? "header-menu is-open" : "header-menu"} id="marketplace-header-menu">
        <nav className="marketplace-nav" aria-label="Navegacion marketplace">
          {items.map((item) => (
            <NavLink
              key={item.path}
              className={({ isActive }) => (isActive ? "active" : "")}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <button className="language-button" aria-label="Idioma espanol" onClick={() => setIsMenuOpen(false)}>
            ES
          </button>
          <button className="login-link" onClick={() => goTo("/acceder")}>
            <LogIn size={22} />
            Iniciar sesion
          </button>
        </div>
      </div>
    </header>
  );
}
