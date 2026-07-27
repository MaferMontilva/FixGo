import { Briefcase, FileText, LayoutDashboard, LogOut, Search, UserRound } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";

const links = [
  { to: "/profesional/panel", label: "Panel", Icon: LayoutDashboard },
  { to: "/profesional/oportunidades", label: "Oportunidades", Icon: Search },
  { to: "/profesional/presupuestos", label: "Presupuestos", Icon: FileText },
  { to: "/profesional/trabajos", label: "Mis trabajos", Icon: Briefcase },
  { to: "/profesional/perfil", label: "Perfil", Icon: UserRound }
];

export function ProfessionalNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="pro-nav">
      <Link to="/profesional/panel" className="pro-nav-brand">
        Fix<span>Go</span> <small>profesionales</small>
      </Link>
      <nav className="pro-nav-links">
        {links.map(({ to, label, Icon }) => (
          <Link key={to} to={to} className={`pro-nav-link ${pathname === to ? "is-active" : ""}`}>
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <button className="pro-nav-logout" type="button" onClick={handleLogout}>
        <LogOut size={18} />
        Salir
      </button>
    </header>
  );
}
