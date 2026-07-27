import { LayoutDashboard, LogOut } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";
import type { ApiError } from "../../../shared/types/apiError";
import {
  getAdminCategories,
  getAdminProfessionals,
  getAdminServiceRequests,
  getAdminStats,
  getAdminUsers,
  setCategoryActive,
  setProfessionalVerification,
  setUserStatus
} from "../services/adminApi";
import type { AdminCategory, AdminProfessional, AdminServiceRequest, AdminStats, AdminUser } from "../types/admin";

type Tab = "resumen" | "usuarios" | "profesionales" | "solicitudes" | "categorias";

const tabs: { id: Tab; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "usuarios", label: "Usuarios" },
  { id: "profesionales", label: "Profesionales" },
  { id: "solicitudes", label: "Solicitudes" },
  { id: "categorias", label: "Categorias" }
];

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [tab, setTab] = useState<Tab>("resumen");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [professionals, setProfessionals] = useState<AdminProfessional[]>([]);
  const [requests, setRequests] = useState<AdminServiceRequest[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (current: Tab) => {
    setLoading(true);
    setError("");
    try {
      if (current === "resumen") setStats(await getAdminStats());
      if (current === "usuarios") setUsers(await getAdminUsers());
      if (current === "profesionales") setProfessionals(await getAdminProfessionals());
      if (current === "solicitudes") setRequests(await getAdminServiceRequests());
      if (current === "categorias") setCategories(await getAdminCategories());
    } catch (loadError) {
      setError((loadError as ApiError).message || "No pudimos cargar los datos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(tab);
  }, [tab, load]);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const toggleUser = async (user: AdminUser) => {
    const next = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const updated = await setUserStatus(user.id, next);
      setUsers((current) => current.map((item) => (item.id === user.id ? updated : item)));
    } catch (actionError) {
      setError((actionError as ApiError).message || "No se pudo actualizar el usuario.");
    }
  };

  const verifyProfessional = async (professional: AdminProfessional, status: string) => {
    try {
      const updated = await setProfessionalVerification(professional.id, status);
      setProfessionals((current) => current.map((item) => (item.id === professional.id ? updated : item)));
    } catch (actionError) {
      setError((actionError as ApiError).message || "No se pudo actualizar el profesional.");
    }
  };

  const toggleCategory = async (category: AdminCategory) => {
    try {
      const updated = await setCategoryActive(category.id, !category.isActive);
      setCategories((current) => current.map((item) => (item.id === category.id ? updated : item)));
    } catch (actionError) {
      setError((actionError as ApiError).message || "No se pudo actualizar la categoria.");
    }
  };

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div className="admin-brand">
          <LayoutDashboard size={22} />
          <div>
            Fix<span>Go</span> <small>Administracion</small>
          </div>
        </div>
        <button className="admin-logout" type="button" onClick={handleLogout}>
          <LogOut size={18} /> Salir
        </button>
      </header>

      <nav className="admin-tabs">
        {tabs.map((item) => (
          <button key={item.id} type="button" className={`admin-tab ${tab === item.id ? "is-active" : ""}`} onClick={() => setTab(item.id)}>
            {item.label}
          </button>
        ))}
      </nav>

      <section className="admin-content">
        {error ? <p className="form-error server-error">{error}</p> : null}
        {loading ? <p className="admin-loading">Cargando...</p> : null}

        {tab === "resumen" && stats ? (
          <div className="admin-stats-grid">
            <div className="admin-stat"><span>{stats.totalUsers}</span>Usuarios</div>
            <div className="admin-stat"><span>{stats.clients}</span>Clientes</div>
            <div className="admin-stat"><span>{stats.professionals}</span>Profesionales</div>
            <div className="admin-stat"><span>{stats.activeProfessionals}</span>Profesionales activos</div>
            <div className="admin-stat"><span>{stats.publishedRequests}</span>Solicitudes publicadas</div>
            <div className="admin-stat"><span>{stats.serviceOrders}</span>Ordenes de trabajo</div>
            <div className="admin-stat"><span>{stats.reviews}</span>Valoraciones</div>
          </div>
        ) : null}

        {tab === "usuarios" ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Roles</th><th>Estado</th><th>Accion</th></tr></thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.roles.join(", ")}</td>
                    <td><span className={`admin-badge status-${user.status}`}>{user.status}</span></td>
                    <td>
                      {user.roles.includes("ADMIN") ? (
                        <span className="admin-muted">-</span>
                      ) : (
                        <button className="admin-action" type="button" onClick={() => toggleUser(user)}>
                          {user.status === "ACTIVE" ? "Suspender" : "Activar"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === "profesionales" ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Verificacion</th><th>Perfil</th><th>Nota</th><th>Acciones</th></tr></thead>
              <tbody>
                {professionals.map((professional) => (
                  <tr key={professional.id}>
                    <td>{professional.id}</td>
                    <td>{professional.businessName || professional.displayName}</td>
                    <td>{professional.email}</td>
                    <td><span className={`admin-badge verif-${professional.verificationStatus}`}>{professional.verificationStatus}</span></td>
                    <td>{professional.profileStatus}</td>
                    <td>{professional.ratingAverage.toFixed(1)} ({professional.ratingsCount})</td>
                    <td className="admin-actions-cell">
                      <button className="admin-action ok" type="button" onClick={() => verifyProfessional(professional, "APPROVED")}>Verificar</button>
                      <button className="admin-action danger" type="button" onClick={() => verifyProfessional(professional, "REJECTED")}>Rechazar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === "solicitudes" ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Titulo</th><th>Cliente</th><th>Categoria</th><th>Urgencia</th><th>Estado</th></tr></thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.id}</td>
                    <td>{request.title || "-"}</td>
                    <td>{request.clientName}</td>
                    <td>{request.categoryName || "-"}</td>
                    <td>{request.urgency}</td>
                    <td><span className="admin-badge">{request.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === "categorias" ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Nombre</th><th>Codigo</th><th>Servicios</th><th>Estado</th><th>Accion</th></tr></thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>{category.name}</td>
                    <td>{category.code}</td>
                    <td>{category.servicesCount}</td>
                    <td><span className={`admin-badge ${category.isActive ? "status-ACTIVE" : "status-SUSPENDED"}`}>{category.isActive ? "Activa" : "Inactiva"}</span></td>
                    <td>
                      <button className="admin-action" type="button" onClick={() => toggleCategory(category)}>
                        {category.isActive ? "Desactivar" : "Activar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </main>
  );
}
