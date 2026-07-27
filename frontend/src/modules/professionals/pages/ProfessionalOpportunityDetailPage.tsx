import { ArrowLeft, Euro, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProfessionalOpportunity } from "../services/professionalsApi";
import type { ProfessionalOpportunity } from "../types/professionalOnboarding";

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

export function ProfessionalOpportunityDetailPage() {
  const { id } = useParams();
  const [opportunity, setOpportunity] = useState<ProfessionalOpportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await getProfessionalOpportunity(Number(id));
        if (!cancelled) setOpportunity(result);
      } catch {
        if (!cancelled) setError("No fue posible cargar el detalle de la oportunidad.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <main className="pro-dashboard-shell">
      <section className="pro-panel pro-opportunity-detail">
        <Link className="pro-link-button back" to="/profesional/oportunidades"><ArrowLeft size={18} />Volver a oportunidades</Link>
        {loading && <p className="pro-empty-state">Cargando detalle...</p>}
        {error && <p className="pro-page-error" role="alert">{error}</p>}
        {opportunity && (
          <>
            <div className="pro-request-header"><span>Coincide con tu perfil</span><small>{opportunity.publishedAt ?? opportunity.createdAt}</small></div>
            <h1>{opportunity.title || "Solicitud sin título"}</h1>
            <p>{opportunity.description}</p>
            <div className="pro-detail-list">
              <span>{opportunity.category?.name ?? "Categoría pendiente"}</span>
              <span>{opportunity.service?.name ?? "Servicio por concretar"}</span>
              <span><MapPin size={18} /> {opportunity.location ?? "Zona aproximada pendiente"}</span>
              <span>{urgencyLabels[opportunity.urgency] ?? opportunity.urgency}</span>
              <span><Euro size={18} /> {budgetText(opportunity)}</span>
              <span>Disponibilidad: {opportunity.flexibleSchedule ? "Flexible" : [opportunity.preferredDateFrom, opportunity.preferredDateTo].filter(Boolean).join(" - ") || "Por concretar"}</span>
            </div>
            <button className="pro-muted-button" type="button" disabled>Enviar presupuesto</button>
            <p className="pro-helper-text">Disponible en la siguiente fase.</p>
          </>
        )}
      </section>
    </main>
  );
}
