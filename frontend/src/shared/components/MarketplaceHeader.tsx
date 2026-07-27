import { LogIn, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";

const items = [
  { label: "Inicio", path: "/cliente/inicio" },
  { label: "Solicita presupuesto", path: "/cliente/solicitar-presupuesto" },
  { label: "Mis presupuestos", path: "/cliente/mis-presupuestos" },
  { label: "Profesionales", path: "/cliente/profesionales" }
];

type MarketplaceHeaderProps = {
  accountName?: string;
  isAuthenticated?: boolean;
  mobileAccountName?: string;
  onLogout?: () => Promise<void> | void;
};

export function MarketplaceHeader({
  accountName = "Mi cuenta",
  isAuthenticated = false,
  mobileAccountName = "Mi cuenta",
  onLogout
}: MarketplaceHeaderProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const goTo = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  const handleSessionAction = async () => {
    setIsMenuOpen(false);

    if (!isAuthenticated) {
      navigate("/acceder");
      return;
    }

    await onLogout?.();
    navigate("/");
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
          {isAuthenticated ? (
            <span className="account-label" aria-label={`Usuario autenticado: ${accountName}`}>
              <span className="account-label-desktop">Hola, {accountName}</span>
              <span className="account-label-mobile">{mobileAccountName}</span>
            </span>
          ) : null}
          <button className="login-link" onClick={handleSessionAction}>
            {isAuthenticated ? <LogOut size={22} /> : <LogIn size={22} />}
            {isAuthenticated ? "Cerrar sesion" : "Iniciar sesion"}
          </button>
          {!isAuthenticated ? (
            <Link className="register-link" to="/registro" onClick={() => setIsMenuOpen(false)}>
              Crear cuenta
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
