import { Bell, BriefcaseBusiness, CalendarClock, Edit3, Euro, MapPin, Phone, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyProfessionalProfile, getProfessionalOpportunities } from "../services/professionalsApi";
import { loadProfessionalProfilePhoto } from "../storage/professionalOnboardingStorage";
import type { ProfessionalOpportunity, ProfessionalProfileApi } from "../types/professionalOnboarding";

const statusLabel: Record<string, string> = {
  ACTIVE: "Activo",
  INCOMPLETE: "Incompleto",
  SUSPENDED: "Suspendido"
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "FG";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

function formatBudget(opportunity: ProfessionalOpportunity) {
  if (opportunity.budgetMin == null && opportunity.budgetMax == null) return "Sin precio orientativo";
  if (opportunity.budgetMin != null && opportunity.budgetMax != null) return `${opportunity.budgetMin} EUR - ${opportunity.budgetMax} EUR`;
  return `${opportunity.budgetMin ?? opportunity.budgetMax} EUR`;
}

export function ProfessionalDashboardPage() {
  const location = useLocation();
  const [profile, setProfile] = useState<ProfessionalProfileApi | null>(null);
  const [opportunities, setOpportunities] = useState<ProfessionalOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const message = (location.state as { message?: string } | null)?.message;

  useEffect(() => {
    let cancelled = false;
    async function loadDashboard() {
      try {
        const [profileResult, opportunitiesResult] = await Promise.all([
          getMyProfessionalProfile(),
          getProfessionalOpportunities()
        ]);
        if (!cancelled) {
          setProfile(profileResult);
          setOpportunities(opportunitiesResult);
        }
      } catch {
        if (!cancelled) setError("No fue posible cargar el panel profesional.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = profile?.businessName || profile?.displayName || "Profesional FixGo";
  const localPhoto = loadProfessionalProfilePhoto();
  const workArea = [profile?.municipality, profile?.province, profile?.postalCode].filter(Boolean).join(", ") || "Zona pendiente";
  const categories = profile?.categories.map((category) => category.name) ?? [];
  const notifications = [
    !profile ? "Completa tu perfil profesional para aparecer en oportunidades compatibles." : "",
    profile && !profile.profileImageUrl ? "Añade una foto o mantén el avatar con iniciales." : "",
    profile && profile.categories.length === 0 ? "Selecciona categorías de trabajo para recibir oportunidades." : "",
    profile && (!profile.province || !profile.municipality) ? "Completa tu zona de trabajo." : "",
    `${opportunities.length} oportunidades compatibles disponibles.`
  ].filter(Boolean);

  return (
    <main className="pro-dashboard-shell">
      {message && <p className="pro-page-success" aria-live="polite">{message}</p>}
      {error && <p className="pro-page-error" role="alert">{error}</p>}
      <section className="pro-dashboard-hero">
        <div>
          <span className="pro-eyebrow">Panel profesional</span>
          <h1>Hola, {displayName}</h1>
          <p>{loading ? "Cargando tus datos profesionales..." : "Gestiona tu perfil y revisa solicitudes compatibles en tu zona."}</p>
        </div>
        <div className="pro-summary-grid" aria-label="Resumen del perfil profesional">
          <div><span>Estado del perfil</span><strong>{statusLabel[profile?.status ?? "INCOMPLETE"] ?? "Incompleto"}</strong></div>
          <div><span>Zona de trabajo</span><strong>{workArea}</strong></div>
          <div><span>Categorías</span><strong>{categories.slice(0, 2).join(" · ") || "Pendientes"}</strong></div>
        </div>
      </section>

      <section className="pro-dashboard-grid">
        <article className="pro-panel pro-profile-card">
          <div className="pro-profile-top">
            <div className="pro-avatar large">
              {profile?.profileImageUrl ? <img src={profile.profileImageUrl} alt="" /> : localPhoto ? <img src={localPhoto} alt="" /> : <span>{getInitials(displayName)}</span>}
            </div>
            <div>
              <h2>{displayName}</h2>
              <p>{profile?.bio || "Añade una descripción breve para explicar qué trabajos realizas."}</p>
            </div>
          </div>
          <div className="pro-detail-list">
            <span><BriefcaseBusiness size={18} /> {categories.join(", ") || "Categorías pendientes"}</span>
            <span><CalendarClock size={18} /> {profile?.yearsExperience ?? 0} años de experiencia</span>
            <span><Phone size={18} /> {profile?.phone ? `+34 ${profile.phone}` : "Teléfono pendiente"}</span>
            <span><MapPin size={18} /> {workArea}</span>
            <span><ShieldCheck size={18} /> {profile?.email || "Email pendiente"}</span>
            <span><CalendarClock size={18} /> {profile?.availability || "Disponibilidad pendiente"}</span>
          </div>
          <Link className="pro-secondary-button" to="/profesional/perfil"><Edit3 size={18} />Editar perfil</Link>
        </article>

        <article className="pro-panel">
          <div className="pro-section-title">
            <Bell size={22} />
            <div><h2>Notificaciones</h2><p>Avisos calculados con tus datos actuales.</p></div>
          </div>
          <div className="pro-notification-list">
            {notifications.map((notification) => (
              <div className="pro-notification" key={notification}>
                <strong>{notification}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="pro-panel pro-marketplace-panel">
        <div className="pro-section-title">
          <BriefcaseBusiness size={22} />
          <div><h2>Marketplace de solicitudes</h2><p>Solicitudes publicadas que coinciden con tu perfil.</p></div>
        </div>
        {!opportunities.length && !loading ? (
          <p className="pro-empty-state">No hay oportunidades compatibles en este momento.</p>
        ) : (
          <div className="pro-request-grid">
            {opportunities.slice(0, 3).map((request) => (
              <article className="pro-request-card" key={request.id}>
                <div className="pro-request-header"><span>Coincide con tu perfil</span><small>{request.publishedAt ?? request.createdAt}</small></div>
                <h3>{request.title || "Solicitud sin título"}</h3>
                <p>{request.description}</p>
                <div className="pro-request-meta">
                  <span>{request.category?.name ?? "Categoría"}</span>
                  <span>{request.service?.name ?? "Servicio por concretar"}</span>
                  <span><MapPin size={16} /> {request.location ?? "Zona aproximada pendiente"}</span>
                  <span>{request.urgency}</span>
                  <span><Euro size={16} /> {formatBudget(request)}</span>
                </div>
                <div className="pro-card-actions">
                  <Link className="pro-primary-button" to={`/profesional/oportunidades/${request.id}`}>Ver oportunidad</Link>
                  <button className="pro-muted-button" type="button" disabled>Envío de presupuesto disponible en la siguiente fase</button>
                </div>
              </article>
            ))}
          </div>
        )}
        <Link className="pro-secondary-button pro-marketplace-link" to="/profesional/oportunidades">Ver todas las oportunidades</Link>
      </section>
    </main>
  );
}
