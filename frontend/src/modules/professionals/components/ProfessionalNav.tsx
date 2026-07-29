import { Briefcase, FileText, LayoutDashboard, LogOut, Menu, Search, Star, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";
import { NotificationBell } from "../../notifications";

const links = [
  { to: "/profesional/panel", label: "Panel", Icon: LayoutDashboard },
  { to: "/profesional/oportunidades", label: "Oportunidades", Icon: Search },
  { to: "/profesional/presupuestos", label: "Presupuestos", Icon: FileText },
  { to: "/profesional/trabajos", label: "Mis trabajos", Icon: Briefcase },
  { to: "/profesional/valoraciones", label: "Valoraciones", Icon: Star },
  { to: "/profesional/perfil", label: "Perfil", Icon: UserRound }
];

export function ProfessionalNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="pro-nav">
      <Link to="/profesional/panel" className="pro-nav-brand" onClick={() => setIsMenuOpen(false)}>
        Fix<span>Go</span> <small>profesionales</small>
      </Link>

      <button
        className="pro-nav-toggle"
        type="button"
        aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((current) => !current)}
      >
        {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div className={isMenuOpen ? "pro-nav-collapse is-open" : "pro-nav-collapse"}>
        <nav className="pro-nav-links">
          {links.map(({ to, label, Icon }) => (
            <Link key={to} to={to} className={`pro-nav-link ${pathname === to ? "is-active" : ""}`} onClick={() => setIsMenuOpen(false)}>
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="pro-nav-actions">
          {isAuthenticated ? <NotificationBell /> : null}
          <button className="pro-nav-logout" type="button" onClick={handleLogout}>
            <LogOut size={18} />
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
