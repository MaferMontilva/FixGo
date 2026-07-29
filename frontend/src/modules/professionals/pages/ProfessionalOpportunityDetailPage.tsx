import { ArrowLeft, Euro, MapPin, ThumbsDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { dismissProfessionalOpportunity, getProfessionalOpportunity, type DismissReason } from "../services/professionalsApi";
import { SendBudgetForm } from "../../budgets";
import type { ApiError } from "../../../shared/types/apiError";
import type { ProfessionalOpportunity } from "../types/professionalOnboarding";
import { ProfessionalNav } from "../components/ProfessionalNav";

const DISMISS_REASONS: { value: DismissReason; label: string }[] = [
  { value: "TOO_EXPENSIVE", label: "El precio no me compensa" },
  { value: "TOO_FAR", label: "Queda muy lejos" },
  { value: "OUT_OF_SERVICE", label: "Fuera de mis servicios" },
  { value: "BUSY", label: "Agenda llena" },
  { value: "OTHER", label: "Otro motivo" }
];

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

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function availabilityText(opportunity: ProfessionalOpportunity) {
  if (opportunity.flexibleSchedule) return "Horario flexible";
  const range = [opportunity.preferredDateFrom, opportunity.preferredDateTo].filter(Boolean).map((value) => formatDate(value)).filter(Boolean);
  return range.length ? range.join(" – ") : "Por concretar";
}

export function ProfessionalOpportunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState<ProfessionalOpportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDismiss, setShowDismiss] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  const handleDismiss = async (reason: DismissReason) => {
    try {
      setDismissing(true);
      await dismissProfessionalOpportunity(Number(id), reason);
      navigate("/profesional/oportunidades");
    } catch (dismissError) {
      setError((dismissError as ApiError).message || "No pudimos descartar la oportunidad.");
      setDismissing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await getProfessionalOpportunity(Number(id));
        if (!cancelled) setOpportunity(result);
      } catch (loadError) {
        if (!cancelled) {
          const status = (loadError as ApiError).status;
          setError(
            status === 404
              ? "Esta oportunidad ya no está disponible. Es posible que la solicitud ya haya sido adjudicada, completada o cancelada."
              : "No fue posible cargar el detalle de la oportunidad."
          );
        }
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
      <ProfessionalNav />
      <section className="pro-panel pro-opportunity-detail">
        <Link className="pro-link-button back" to="/profesional/oportunidades"><ArrowLeft size={18} />Volver a oportunidades</Link>
        {loading && <p className="pro-empty-state">Cargando detalle...</p>}
        {error && <p className="pro-page-error" role="alert">{error}</p>}
        {opportunity && (
          <>
            <div className="opp-detail-head">
              <span className="opp-badge">Coincide con tu perfil</span>
              <small>{formatDate(opportunity.publishedAt ?? opportunity.createdAt)}</small>
            </div>
            <h1>{opportunity.title || "Solicitud sin título"}</h1>
            <p className="opp-detail-desc">{opportunity.description}</p>
            <dl className="opp-detail-grid">
              <div><dt>Categoría</dt><dd>{opportunity.category?.name ?? "Categoría pendiente"}</dd></div>
              <div><dt>Servicio</dt><dd>{opportunity.service?.name ?? "Servicio por concretar"}</dd></div>
              <div>
                <dt>Ubicación</dt>
                <dd><MapPin size={15} /> {opportunity.location ?? "Zona aproximada pendiente"}</dd>
              </div>
              <div>
                <dt>Urgencia</dt>
                <dd><span className="opp-detail-urgency">{urgencyLabels[opportunity.urgency] ?? opportunity.urgency}</span></dd>
              </div>
              <div>
                <dt>Precio orientativo de FixGo IA</dt>
                <dd><Euro size={15} /> {budgetText(opportunity)}</dd>
              </div>
              <div><dt>Disponibilidad</dt><dd>{availabilityText(opportunity)}</dd></div>
            </dl>
            <SendBudgetForm serviceRequestId={opportunity.id} />

            <div className="opp-dismiss">
              {!showDismiss ? (
                <button type="button" className="opp-dismiss-trigger" onClick={() => setShowDismiss(true)}>
                  <ThumbsDown size={16} /> No me interesa esta oportunidad
                </button>
              ) : (
                <div className="opp-dismiss-panel">
                  <p>¿Por qué la descartas? Se quitará de tus oportunidades (no se avisa al cliente).</p>
                  <div className="opp-dismiss-reasons">
                    {DISMISS_REASONS.map((reason) => (
                      <button
                        key={reason.value}
                        type="button"
                        className="opp-dismiss-chip"
                        disabled={dismissing}
                        onClick={() => handleDismiss(reason.value)}
                      >
                        {reason.label}
                      </button>
                    ))}
                  </div>
                  <button type="button" className="pro-link-button" onClick={() => setShowDismiss(false)} disabled={dismissing}>
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
