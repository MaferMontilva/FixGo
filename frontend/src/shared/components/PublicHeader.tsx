import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "./Logo";

type PublicHeaderProps = {
  accountName?: string;
  isAuthenticated?: boolean;
  onLogout?: () => Promise<void> | void;
};

export function PublicHeader({ accountName = "Mi cuenta", isAuthenticated = false, onLogout }: PublicHeaderProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const goTo = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await onLogout?.();
    navigate("/");
  };

  return (
    <header className="public-header">
      <button className="brand-button" onClick={() => goTo("/")} aria-label="Ir al inicio">
        <Logo compact />
      </button>

      <button
        className="mobile-menu-button"
        type="button"
        aria-label={isMenuOpen ? "Cerrar menu" : "Abrir menu"}
        aria-controls="public-header-menu"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((current) => !current)}
      >
        {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div className={isMenuOpen ? "header-menu is-open" : "header-menu"} id="public-header-menu">
        <nav className="public-nav" aria-label="Navegacion publica">
          <button onClick={() => goTo("/cliente/inicio")}>Soy cliente</button>
          <button onClick={() => goTo("/profesional/inicio")}>Soy profesional</button>
          {isAuthenticated ? (
            <>
              <span className="account-label public-account-label">Hola, {accountName}</span>
              <button className="login-link" onClick={handleLogout}>
                <LogOut size={20} />
                Cerrar sesion
              </button>
            </>
          ) : (
            <>
              <button onClick={() => goTo("/acceder")}>Iniciar sesion</button>
              <button onClick={() => goTo("/registro")}>Crear cuenta</button>
            </>
          )}
        </nav>
        <button className="primary-pill header-cta" onClick={() => goTo("/cliente/solicitar-presupuesto")}>
          Pide presupuesto
        </button>
      </div>
    </header>
  );
}
