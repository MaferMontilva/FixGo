import { ArrowLeft, Clock, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card } from "../../../shared/components/Card";
import { PageContainer } from "../../../shared/components/PageContainer";
import type { ApiError } from "../../../shared/types/apiError";
import { getRequestBudgets } from "../services/budgetsApi";
import { acceptBudget } from "../../service-orders";
import type { Budget } from "../types/budget";

function formatMoney(value: number, currency: string) {
  return `${value.toFixed(2)} ${currency}`;
}

function durationText(budget: Budget) {
  if (!budget.estimatedDurationValue) return null;
  const units: Record<string, string> = { HOURS: "horas", DAYS: "dias", WEEKS: "semanas" };
  const unit = budget.estimatedDurationUnit ? units[budget.estimatedDurationUnit] ?? budget.estimatedDurationUnit.toLowerCase() : "";
  return `${budget.estimatedDurationValue} ${unit}`.trim();
}

export function RequestBudgetsPage() {
  const { id } = useParams();
  const requestId = Number(id);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleAccept = async (budgetId: number) => {
    try {
      setAcceptingId(budgetId);
      setError("");
      await acceptBudget(budgetId);
      navigate("/cliente/trabajos");
    } catch (acceptError) {
      const apiError = acceptError as { message?: string };
      setError(apiError.message || "No pudimos aceptar el presupuesto.");
      setAcceptingId(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await getRequestBudgets(requestId);
        if (!cancelled) setBudgets(result);
      } catch (loadError) {
        const apiError = loadError as ApiError;
        if (!cancelled) setError(apiError.message || "No pudimos cargar los presupuestos.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [requestId]);

  const cheapest = budgets.length ? Math.min(...budgets.map((budget) => budget.totalPrice)) : null;
  const acceptedBudget = budgets.find((budget) => budget.status === "ACCEPTED") ?? null;

  return (
    <PageContainer className="budgets-compare-shell">
      <Link className="budgets-back-link" to="/cliente/mis-presupuestos">
        <ArrowLeft size={18} /> Volver a mis solicitudes
      </Link>
      <section className="client-requests-header">
        <span className="client-requests-kicker">Área del cliente</span>
        <h1>Presupuestos recibidos</h1>
        <p>Compara las propuestas de los profesionales para tu solicitud #{requestId}.</p>
      </section>

      {acceptedBudget ? (
        <div className="budgets-accepted-banner">
          <p>
            Ya aceptaste el presupuesto de <strong>{acceptedBudget.professional?.businessName || acceptedBudget.professional?.displayName || "un profesional"}</strong>. Sigue el servicio en{" "}
            <Link to="/cliente/trabajos">Servicios contratados</Link>.
          </p>
        </div>
      ) : null}
      {loading ? <p className="budgets-compare-empty">Cargando presupuestos...</p> : null}
      {error ? <p className="form-error server-error">{error}</p> : null}

      {!loading && !error && budgets.length === 0 ? (
        <Card className="budgets-compare-empty-card">
          <p>Todavia no has recibido presupuestos para esta solicitud. Te avisaremos cuando lleguen.</p>
        </Card>
      ) : null}

      <div className="budgets-compare-list">
        {budgets.map((budget) => {
          const isCheapest = cheapest !== null && budget.totalPrice === cheapest;
          const duration = durationText(budget);
          return (
            <Card className={`budget-card ${isCheapest ? "is-best" : ""}`} key={budget.id}>
              <div className="budget-card-head">
                <div>
                  <h2>{budget.professional?.businessName || budget.professional?.displayName || "Profesional"}</h2>
                  {budget.professional ? (
                    <p className="budget-card-rating">
                      <Star size={16} /> {budget.professional.ratingAverage.toFixed(1)} ({budget.professional.ratingsCount})
                    </p>
                  ) : null}
                </div>
                <div className="budget-card-price">
                  <strong>{formatMoney(budget.totalPrice, budget.currency)}</strong>
                  {budget.status === "ACCEPTED" ? (
                    <span className="budget-accepted-badge">Aceptado</span>
                  ) : budget.status === "REJECTED" ? (
                    <span className="budget-rejected-badge">No seleccionado</span>
                  ) : isCheapest ? (
                    <span className="budget-best-badge">Mas economico</span>
                  ) : null}
                </div>
              </div>

              <ul className="budget-card-items">
                {budget.items.map((item) => (
                  <li key={item.id}>
                    <span>{item.description}</span>
                    <span>
                      {item.quantity} x {item.unitPrice.toFixed(2)} = {item.total.toFixed(2)} {budget.currency}
                    </span>
                  </li>
                ))}
              </ul>

              {duration ? (
                <p className="budget-card-meta">
                  <Clock size={16} /> Duracion estimada: {duration}
                </p>
              ) : null}
              {budget.observations ? <p className="budget-card-notes">{budget.observations}</p> : null}

              {!acceptedBudget && (budget.status === "SENT" || budget.status === "VIEWED") ? (
                <button className="pro-primary-button" type="button" disabled={acceptingId === budget.id} onClick={() => handleAccept(budget.id)}>
                  {acceptingId === budget.id ? "Aceptando..." : "Aceptar presupuesto"}
                </button>
              ) : null}
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
