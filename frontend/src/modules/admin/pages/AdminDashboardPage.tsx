import { BriefcaseBusiness, ClipboardList, Layers, LayoutDashboard, LogOut, Search, TrendingUp, UserPlus, Users, Wallet } from "lucide-react";
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
  cancelServiceRequest,
  createUser,
  createCategory,
  deleteCategory,
  deleteServiceRequest,
  setCategoryActive,
  setProfessionalVerification,
  setUserAdminRole,
  setUserStatus,
  updateCategory
} from "../services/adminApi";
import type { AdminCategory, AdminProfessional, AdminServiceRequest, AdminStats, AdminUser } from "../types/admin";

type Tab = "resumen" | "usuarios" | "profesionales" | "solicitudes" | "categorias";

const CATEGORY_CODE_REGEX = /^[A-Za-z0-9_-]+$/;
const CATEGORY_NAME_REGEX = /^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ.,&' -]+$/;

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: currency || "EUR", maximumFractionDigits: 0 }).format(value || 0);
}

// Traducciones solo de presentacion: el codigo real (COMPLETED, ACTIVE, etc.)
// se mantiene en la base y en la logica; aqui solo se muestra en espanol.
const ROLE_ES: Record<string, string> = { SUPER_ADMIN: "Administrador master", ADMIN: "Administrador", PROFESSIONAL: "Profesional", CLIENT: "Cliente" };
const USER_STATUS_ES: Record<string, string> = { ACTIVE: "Activo", SUSPENDED: "Suspendido", BLOCKED: "Bloqueado" };
const PROFILE_STATUS_ES: Record<string, string> = { ACTIVE: "Activo", INCOMPLETE: "Incompleto", DRAFT: "Borrador", INACTIVE: "Inactivo" };
const VERIFICATION_ES: Record<string, string> = { PENDING: "Pendiente", IN_REVIEW: "En revisión", APPROVED: "Aprobado", REJECTED: "Rechazado", SUSPENDED: "Suspendido" };
const REQUEST_STATUS_ES: Record<string, string> = {
  DRAFT: "Borrador",
  AI_PROCESSING: "Procesando IA",
  READY_TO_PUBLISH: "Lista para publicar",
  PUBLISHED: "Publicada",
  RECEIVING_BUDGETS: "Recibiendo presupuestos",
  PROFESSIONAL_SELECTED: "Profesional asignado",
  IN_PROGRESS: "En progreso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  EXPIRED: "Expirada"
};
const URGENCY_ES: Record<string, string> = { LOW: "Baja", NORMAL: "Normal", HIGH: "Alta", EMERGENCY: "Emergencia" };
const es = (map: Record<string, string>, code: string) => map[code] ?? code;

const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "resumen", label: "Resumen", icon: LayoutDashboard },
  { id: "usuarios", label: "Usuarios", icon: Users },
  { id: "profesionales", label: "Profesionales", icon: BriefcaseBusiness },
  { id: "solicitudes", label: "Solicitudes", icon: ClipboardList },
  { id: "categorias", label: "Categorías", icon: Layers }
];

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { logout, user: authUser } = useAuth();
  const [tab, setTab] = useState<Tab>("resumen");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [professionals, setProfessionals] = useState<AdminProfessional[]>([]);
  const [requests, setRequests] = useState<AdminServiceRequest[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newCategory, setNewCategory] = useState({ code: "", name: "" });
  const [savingCategory, setSavingCategory] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [newUser, setNewUser] = useState<{ firstName: string; lastName: string; email: string; password: string; role: "CLIENT" | "PROFESSIONAL" | "ADMIN" }>({ firstName: "", lastName: "", email: "", password: "", role: "CLIENT" });
  const [creatingUser, setCreatingUser] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [lockRole, setLockRole] = useState(false);

  const currentIsMaster = authUser?.roles.includes("SUPER_ADMIN") ?? false;
  const q = search.trim().toLowerCase();
  const changeTab = (next: Tab) => {
    setTab(next);
    setSearch("");
    setNotice("");
    setError("");
  };

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

  const toggleAdminRole = async (user: AdminUser, grant: boolean) => {
    setError("");
    setNotice("");
    try {
      const updated = await setUserAdminRole(user.id, grant);
      setUsers((current) => current.map((item) => (item.id === user.id ? updated : item)));
      setNotice(grant ? `${updated.firstName} ahora es administrador.` : `${updated.firstName} ya no es administrador.`);
    } catch (actionError) {
      setError((actionError as ApiError).message || "No se pudo actualizar el permiso.");
    }
  };

  const openCreateUser = (role: "CLIENT" | "PROFESSIONAL" | "ADMIN", locked: boolean) => {
    setNewUser({ firstName: "", lastName: "", email: "", password: "", role });
    setLockRole(locked);
    setShowCreateUser(true);
    setError("");
    setNotice("");
  };

  const roleLabelEs = (role: string) => es(ROLE_ES, role).toLowerCase();

  const handleCreateUser = async () => {
    setError("");
    setNotice("");
    setCreatingUser(true);
    try {
      const created = await createUser({
        firstName: newUser.firstName.trim(),
        lastName: newUser.lastName.trim(),
        email: newUser.email.trim(),
        password: newUser.password,
        role: newUser.role
      });
      setShowCreateUser(false);
      setNotice(`Cuenta de ${roleLabelEs(newUser.role)} creada: ${created.email}. Deberá cambiar su clave temporal al iniciar sesión.`);
      await load(tab);
    } catch (actionError) {
      setError((actionError as ApiError).message || "No se pudo crear la cuenta.");
    } finally {
      setCreatingUser(false);
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

  const handleCreateCategory = async () => {
    const code = newCategory.code.trim();
    const name = newCategory.name.trim();

    if (code.length < 2 || code.length > 40 || !CATEGORY_CODE_REGEX.test(code)) {
      setError("El codigo debe tener entre 2 y 40 caracteres y solo letras, numeros, guiones y guiones bajos.");
      return;
    }
    if (name.length < 2 || name.length > 80 || !CATEGORY_NAME_REGEX.test(name)) {
      setError("El nombre debe tener entre 2 y 80 caracteres y no puede contener simbolos no permitidos.");
      return;
    }

    try {
      setSavingCategory(true);
      setError("");
      const created = await createCategory({ code: code.toUpperCase(), name });
      setCategories((current) => [...current, created]);
      setNewCategory({ code: "", name: "" });
    } catch (actionError) {
      setError((actionError as ApiError).message || "No se pudo crear la categoria.");
    } finally {
      setSavingCategory(false);
    }
  };

  const handleEditCategory = async (category: AdminCategory) => {
    const name = window.prompt("Nuevo nombre de la categoria:", category.name);
    if (!name) return;
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 80 || !CATEGORY_NAME_REGEX.test(trimmedName)) {
      setError("El nombre debe tener entre 2 y 80 caracteres y no puede contener simbolos no permitidos.");
      return;
    }
    try {
      const updated = await updateCategory(category.id, { name: trimmedName });
      setCategories((current) => current.map((item) => (item.id === category.id ? updated : item)));
    } catch (actionError) {
      setError((actionError as ApiError).message || "No se pudo editar la categoria.");
    }
  };

  const handleDeleteCategory = async (category: AdminCategory) => {
    if (!window.confirm(`Eliminar la categoria "${category.name}"? Esta accion no se puede deshacer.`)) return;
    try {
      await deleteCategory(category.id);
      setCategories((current) => current.filter((item) => item.id !== category.id));
    } catch (actionError) {
      setError((actionError as ApiError).message || "No se pudo eliminar la categoria.");
    }
  };

  const handleCancelRequest = async (request: AdminServiceRequest) => {
    if (!window.confirm(`Cancelar la solicitud #${request.id}?`)) return;
    try {
      const updated = await cancelServiceRequest(request.id);
      setRequests((current) => current.map((item) => (item.id === request.id ? updated : item)));
    } catch (actionError) {
      setError((actionError as ApiError).message || "No se pudo cancelar la solicitud.");
    }
  };

  const handleDeleteRequest = async (request: AdminServiceRequest) => {
    if (!window.confirm(`Eliminar la solicitud #${request.id} de la lista?`)) return;
    try {
      await deleteServiceRequest(request.id);
      setRequests((current) => current.filter((item) => item.id !== request.id));
    } catch (actionError) {
      setError((actionError as ApiError).message || "No se pudo eliminar la solicitud.");
    }
  };

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <LayoutDashboard size={22} />
          <div>
            Fix<span>Go</span> <small>Administración</small>
          </div>
        </div>
        <nav className="admin-nav">
          {tabs.map((item) => (
            <button key={item.id} type="button" className={`admin-nav-item ${tab === item.id ? "is-active" : ""}`} onClick={() => changeTab(item.id)}>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
        <button className="admin-logout" type="button" onClick={handleLogout}>
          <LogOut size={18} /> Salir
        </button>
      </aside>

      <section className="admin-content">
        {error ? <p className="form-error server-error">{error}</p> : null}
        {notice ? <p className="admin-notice">{notice}</p> : null}
        {loading ? <p className="admin-loading">Cargando...</p> : null}

        {tab === "resumen" && stats ? (
          <div className="admin-resumen">
            <div className="admin-revenue-row">
              <div className="admin-revenue-card">
                <span className="admin-revenue-label"><Wallet size={18} /> Ingresos generados</span>
                <strong className="admin-revenue-value">{formatMoney(stats.totalRevenue, stats.currency)}</strong>
                <span className="admin-revenue-sub">{stats.serviceOrders} órdenes · {stats.completedOrders} completadas</span>
              </div>
              <div className="admin-revenue-card soft">
                <span className="admin-revenue-label"><TrendingUp size={18} /> Ticket promedio</span>
                <strong className="admin-revenue-value">{formatMoney(stats.serviceOrders ? stats.totalRevenue / stats.serviceOrders : 0, stats.currency)}</strong>
                <span className="admin-revenue-sub">por orden de trabajo</span>
              </div>
            </div>

            <div className="admin-stats-grid">
              <div className="admin-stat"><span>{stats.totalUsers}</span>Usuarios</div>
              <div className="admin-stat"><span>{stats.admins}</span>Administradores</div>
              <div className="admin-stat"><span>{stats.clients}</span>Clientes</div>
              <div className="admin-stat"><span>{stats.professionals}</span>Profesionales</div>
              <div className="admin-stat"><span>{stats.activeProfessionals}</span>Profesionales activos</div>
              <div className="admin-stat"><span>{stats.suspendedUsers}</span>Usuarios suspendidos</div>
              <div className="admin-stat"><span>{stats.publishedRequests}</span>Solicitudes publicadas</div>
              <div className="admin-stat"><span>{stats.serviceOrders}</span>Órdenes de trabajo</div>
              <div className="admin-stat"><span>{stats.reviews}</span>Valoraciones</div>
            </div>

            {stats.revenueByCategory.length ? (
              <div className="admin-panel-card">
                <h3 className="admin-panel-title">Ingresos por categoría</h3>
                <div className="admin-catrev-list">
                  {stats.revenueByCategory.map((row) => {
                    const max = stats.revenueByCategory[0]?.revenue || 1;
                    const pct = Math.max(4, Math.round((row.revenue / max) * 100));
                    return (
                      <div className="admin-catrev-row" key={row.category}>
                        <span className="admin-catrev-name">{row.category}</span>
                        <div className="admin-catrev-bar"><div className="admin-catrev-fill" style={{ width: `${pct}%` }} /></div>
                        <span className="admin-catrev-amount">{formatMoney(row.revenue, stats.currency)}</span>
                        <span className="admin-catrev-orders">{row.orders} ord.</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {tab === "usuarios" ? (
          <div className="admin-table-wrap">
            <div className="admin-toolbar">
              <button className="admin-action ok" type="button" onClick={() => openCreateUser("CLIENT", false)}>
                <UserPlus size={16} /> Crear usuario
              </button>
            </div>
            <div className="admin-search-bar">
              <Search size={16} />
              <input className="admin-search" placeholder="Buscar por nombre, correo o rol..." value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Roles</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {users
                  .filter((user) => !q || `${user.firstName} ${user.lastName} ${user.email ?? ""} ${user.roles.join(" ")}`.toLowerCase().includes(q))
                  .map((user) => {
                    const isSelf = Boolean(authUser && user.id === authUser.id);
                    const targetIsMaster = user.roles.includes("SUPER_ADMIN");
                    const targetIsAdmin = user.roles.includes("ADMIN");
                    const roleLabel = targetIsMaster ? "Administrador master" : user.roles.map((role) => es(ROLE_ES, role)).join(", ");
                    const canToggleStatus = currentIsMaster || !targetIsAdmin;
                    return (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.email}</td>
                        <td>{roleLabel}</td>
                        <td><span className={`admin-badge status-${user.status}`}>{es(USER_STATUS_ES, user.status)}</span></td>
                        <td className="admin-actions-cell">
                          {isSelf ? (
                            <span className="admin-muted" title="Tu propia cuenta">Tú</span>
                          ) : targetIsMaster ? (
                            <span className="admin-muted" title="Los administradores master están protegidos">Master protegido</span>
                          ) : (
                            <>
                              {canToggleStatus ? (
                                <button className="admin-action" type="button" onClick={() => toggleUser(user)}>
                                  {user.status === "ACTIVE" ? "Suspender" : "Activar"}
                                </button>
                              ) : (
                                <span className="admin-muted" title="Solo un administrador master puede gestionar administradores">—</span>
                              )}
                              {currentIsMaster ? (
                                targetIsAdmin ? (
                                  <button className="admin-action danger" type="button" onClick={() => toggleAdminRole(user, false)}>Quitar admin</button>
                                ) : (
                                  <button className="admin-action ok" type="button" onClick={() => toggleAdminRole(user, true)}>Hacer admin</button>
                                )
                              ) : null}
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === "profesionales" ? (
          <div className="admin-table-wrap">
            <div className="admin-toolbar">
              <button className="admin-action ok" type="button" onClick={() => openCreateUser("PROFESSIONAL", true)}>
                <UserPlus size={16} /> Crear profesional
              </button>
            </div>
            <div className="admin-search-bar">
              <Search size={16} />
              <input className="admin-search" placeholder="Buscar profesional por nombre o correo..." value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Verificacion</th><th>Perfil</th><th>Nota</th><th>Acciones</th></tr></thead>
              <tbody>
                {professionals
                  .filter((professional) => !q || `${professional.displayName} ${professional.businessName ?? ""} ${professional.email ?? ""}`.toLowerCase().includes(q))
                  .map((professional) => (
                  <tr key={professional.id}>
                    <td>{professional.id}</td>
                    <td>{professional.businessName || professional.displayName}</td>
                    <td>{professional.email}</td>
                    <td><span className={`admin-badge verif-${professional.verificationStatus}`}>{es(VERIFICATION_ES, professional.verificationStatus)}</span></td>
                    <td>{es(PROFILE_STATUS_ES, professional.profileStatus)}</td>
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
            <div className="admin-search-bar">
              <Search size={16} />
              <input className="admin-search" placeholder="Buscar por título, cliente, categoría o estado..." value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Titulo</th><th>Cliente</th><th>Categoria</th><th>Urgencia</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {requests
                  .filter((request) => !q || `${request.title ?? ""} ${request.clientName} ${request.categoryName ?? ""} ${request.status}`.toLowerCase().includes(q))
                  .map((request) => {
                  const cancellable = request.status !== "CANCELLED" && request.status !== "COMPLETED";
                  return (
                    <tr key={request.id}>
                      <td>{request.id}</td>
                      <td>{request.title || "-"}</td>
                      <td>{request.clientName}</td>
                      <td>{request.categoryName || "-"}</td>
                      <td>{es(URGENCY_ES, request.urgency)}</td>
                      <td><span className="admin-badge">{es(REQUEST_STATUS_ES, request.status)}</span></td>
                      <td className="admin-actions-cell">
                        <button
                          className="admin-action"
                          type="button"
                          disabled={!cancellable}
                          title={cancellable ? "Cancelar la solicitud" : "No se puede cancelar en este estado"}
                          onClick={() => cancellable && handleCancelRequest(request)}
                        >
                          Cancelar
                        </button>
                        <button className="admin-action danger" type="button" onClick={() => handleDeleteRequest(request)}>Eliminar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === "categorias" ? (
          <div className="admin-table-wrap">
            <div className="admin-create-row">
              <input className="admin-input" placeholder="CODIGO (ej. GARDENING)" value={newCategory.code} onChange={(event) => setNewCategory((current) => ({ ...current, code: event.target.value }))} />
              <input className="admin-input" placeholder="Nombre (ej. Jardineria)" value={newCategory.name} onChange={(event) => setNewCategory((current) => ({ ...current, name: event.target.value }))} />
              <button className="admin-action ok" type="button" disabled={savingCategory} onClick={handleCreateCategory}>{savingCategory ? "Creando..." : "Crear categoria"}</button>
            </div>
            <div className="admin-search-bar">
              <Search size={16} />
              <input className="admin-search" placeholder="Buscar categoría por nombre o código..." value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Nombre</th><th>Codigo</th><th>Servicios</th><th>Estado</th><th>Accion</th></tr></thead>
              <tbody>
                {categories
                  .filter((category) => !q || `${category.name} ${category.code}`.toLowerCase().includes(q))
                  .map((category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>{category.name}</td>
                    <td>{category.code}</td>
                    <td>{category.servicesCount}</td>
                    <td><span className={`admin-badge ${category.isActive ? "status-ACTIVE" : "status-SUSPENDED"}`}>{category.isActive ? "Activa" : "Inactiva"}</span></td>
                    <td className="admin-actions-cell">
                      <button className="admin-action" type="button" onClick={() => handleEditCategory(category)}>Editar</button>
                      <button className="admin-action" type="button" onClick={() => toggleCategory(category)}>{category.isActive ? "Desactivar" : "Activar"}</button>
                      <button className="admin-action danger" type="button" onClick={() => handleDeleteCategory(category)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {showCreateUser ? (
          <div className="admin-modal-overlay" role="dialog" aria-modal="true" onClick={() => setShowCreateUser(false)}>
            <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
              <h3 className="admin-modal-title"><UserPlus size={18} /> Crear {roleLabelEs(newUser.role)}</h3>
              <p className="admin-modal-hint">Se crea con una clave temporal. La persona deberá cambiarla la primera vez que inicie sesión.</p>
              <label className="admin-modal-field">Nombre
                <input className="admin-input" value={newUser.firstName} onChange={(event) => setNewUser((current) => ({ ...current, firstName: event.target.value }))} />
              </label>
              <label className="admin-modal-field">Apellido
                <input className="admin-input" value={newUser.lastName} onChange={(event) => setNewUser((current) => ({ ...current, lastName: event.target.value }))} />
              </label>
              <label className="admin-modal-field">Correo
                <input className="admin-input" type="email" value={newUser.email} onChange={(event) => setNewUser((current) => ({ ...current, email: event.target.value }))} />
              </label>
              <label className="admin-modal-field">Rol
                <select
                  className="admin-input"
                  value={newUser.role}
                  disabled={lockRole}
                  onChange={(event) => setNewUser((current) => ({ ...current, role: event.target.value as "CLIENT" | "PROFESSIONAL" | "ADMIN" }))}
                >
                  <option value="CLIENT">Cliente</option>
                  <option value="PROFESSIONAL">Profesional</option>
                  {currentIsMaster ? <option value="ADMIN">Administrador</option> : null}
                </select>
              </label>
              {!currentIsMaster ? <p className="admin-modal-hint">Solo un administrador master puede crear administradores.</p> : null}
              <label className="admin-modal-field">Clave temporal
                <input className="admin-input" value={newUser.password} onChange={(event) => setNewUser((current) => ({ ...current, password: event.target.value }))} placeholder="Mínimo 8, con letra y número" />
              </label>
              {error ? <p className="form-error server-error">{error}</p> : null}
              <div className="admin-modal-actions">
                <button className="admin-action" type="button" onClick={() => setShowCreateUser(false)}>Cancelar</button>
                <button className="admin-action ok" type="button" disabled={creatingUser} onClick={handleCreateUser}>{creatingUser ? "Creando..." : "Crear"}</button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
