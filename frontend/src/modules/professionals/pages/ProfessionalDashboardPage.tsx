import { Star } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyProfessionalProfile, getProfessionalOpportunities } from "../services/professionalsApi";
import type { ProfessionalOpportunity, ProfessionalProfileApi } from "../types/professionalOnboarding";
import { ProfessionalNav } from "../components/ProfessionalNav";

const statusLabel: Record<string, string> = {
  ACTIVE: "Activo",
  INCOMPLETE: "Incompleto",
  SUSPENDED: "Suspendido"
};

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
  const workArea = [profile?.municipality, profile?.province, profile?.postalCode].filter(Boolean).join(", ") || "Zona pendiente";
  const categories = profile?.categories.map((category) => category.name) ?? [];

  return (
    <main className="pro-dashboard-shell">
      <ProfessionalNav />
      {message && <p className="pro-page-success" aria-live="polite">{message}</p>}
      {error && <p className="pro-page-error" role="alert">{error}</p>}
      <section className="pro-dashboard-hero">
        <div>
          <span className="pro-eyebrow">Panel profesional</span>
          <h1>Hola, {displayName}</h1>
          <p>{loading ? "Cargando tus datos profesionales..." : "Gestiona tu perfil y revisa solicitudes compatibles en tu zona."}</p>
          <div className="pro-hero-rating" aria-label="Valoración del profesional">
            <span className="pro-stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} size={18} className={n <= Math.round(profile?.ratingAverage ?? 0) ? "is-filled" : ""} />
              ))}
            </span>
            <span className="pro-hero-rating-value">
              {(profile?.ratingAverage ?? 0).toFixed(1)}
              {(profile?.ratingsCount ?? 0) > 0 ? ` · ${profile?.ratingsCount} reseñas` : " · Sin reseñas todavía"}
            </span>
          </div>
        </div>
        <div className="pro-summary-grid" aria-label="Resumen del perfil profesional">
          <div><span>Estado del perfil</span><strong>{statusLabel[profile?.status ?? "INCOMPLETE"] ?? "Incompleto"}</strong></div>
          <div><span>Zona de trabajo</span><strong>{workArea}</strong></div>
          <div><span>Categorías</span><strong>{categories.join(" · ") || "Pendientes"}</strong></div>
          <div><span>Oportunidades compatibles</span><strong>{opportunities.length}</strong></div>
        </div>
      </section>

    </main>
  );
}
