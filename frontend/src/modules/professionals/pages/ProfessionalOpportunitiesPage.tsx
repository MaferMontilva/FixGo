import { Euro, MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getProfessionalOpportunities } from "../services/professionalsApi";
import type { ProfessionalOpportunity } from "../types/professionalOnboarding";
import { ProfessionalNav } from "../components/ProfessionalNav";

const urgencyLabels: Record<string, string> = {
  EMERGENCY: "Emergencia",
  HIGH: "Alta",
  LOW: "Baja",
  NORMAL: "Normal"
};

function budgetText(opportunity: ProfessionalOpportunity) {
  if (opportunity.budgetMin == null && opportunity.budgetMax == null) return "Sin precio orientativo";
  if (opportunity.budgetMin != null && opportunity.budgetMax != null) return `${opportunity.budgetMin} EUR - ${opportunity.budgetMax} EUR`;
  return `${opportunity.budgetMin ?? opportunity.budgetMax} EUR`;
}

function formatOppDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function shortText(text: string, max = 180) {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max).trim()}…` : clean;
}

export function ProfessionalOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<ProfessionalOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await getProfessionalOpportunities();
        if (!cancelled) setOpportunities(result);
      } catch {
        if (!cancelled) setError("No fue posible cargar oportunidades reales.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryOptions = [...new Set(opportunities.map((item) => item.category?.name).filter(Boolean))] as string[];
  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return [...opportunities]
      .filter((item) => !normalizedSearch || `${item.title ?? ""} ${item.description}`.toLowerCase().includes(normalizedSearch))
      .filter((item) => !category || item.category?.name === category)
      .filter((item) => !urgency || item.urgency === urgency)
      .sort((first, second) => new Date(second.publishedAt ?? second.createdAt).getTime() - new Date(first.publishedAt ?? first.createdAt).getTime());
  }, [category, opportunities, search, urgency]);

  return (
    <main className="pro-dashboard-shell">
      <ProfessionalNav />
      <section className="pro-panel pro-marketplace-panel">
        <div className="pro-section-title">
          <Search size={24} />
          <div>
            <h1>Oportunidades profesionales</h1>
            <p>Solicitudes publicadas compatibles con tus categorías y zona.</p>
          </div>
        </div>
        <div className="pro-filters">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por título o descripción" />
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">Todas las categorías</option>
            {categoryOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
          <select value={urgency} onChange={(event) => setUrgency(event.target.value)}>
            <option value="">Todas las urgencias</option>
            <option value="LOW">Baja</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">Alta</option>
            <option value="EMERGENCY">Emergencia</option>
          </select>
        </div>
        {error && <p className="pro-page-error" role="alert">{error}</p>}
        {loading && <p className="pro-empty-state">Cargando oportunidades...</p>}
        {!loading && filtered.length === 0 && <p className="pro-empty-state">No hay oportunidades compatibles en este momento.</p>}
        <div className="opp-list">
          {filtered.map((request) => (
            <article className="opp-card" key={request.id}>
              <div className="opp-card-main">
                <div className="opp-card-top">
                  <span className="opp-badge">Coincide con tu perfil</span>
                  <small>{formatOppDate(request.publishedAt ?? request.createdAt)}</small>
                </div>
                <h3>{request.title || "Solicitud sin título"}</h3>
                <p>{shortText(request.description)}</p>
                <div className="opp-chips">
                  <span className="opp-chip">{request.category?.name ?? "Categoría"}</span>
                  <span className="opp-chip">{request.service?.name ?? "Servicio por concretar"}</span>
                  <span className="opp-chip"><MapPin size={14} /> {request.location ?? "Zona pendiente"}</span>
                  <span className="opp-chip">{urgencyLabels[request.urgency] ?? request.urgency}</span>
                </div>
              </div>
              <div className="opp-card-side">
                <div className="opp-price"><Euro size={16} /> {budgetText(request)}</div>
                <Link className="pro-primary-button" to={`/profesional/oportunidades/${request.id}`}>Ver oportunidad</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
