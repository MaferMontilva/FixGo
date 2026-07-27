import { ArrowLeft, Clock, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card } from "../../../shared/components/Card";
import { PageContainer } from "../../../shared/components/PageContainer";
import type { ApiError } from "../../../shared/types/apiError";
import { getRequestBudgets } from "../services/budgetsApi";
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

  return (
    <PageContainer className="budgets-compare-shell">
      <Link className="request-secondary-action" to="/cliente/mis-presupuestos">
        <ArrowLeft size={18} /> Volver a mis solicitudes
      </Link>
      <h1 className="budgets-compare-title">Presupuestos recibidos</h1>
      <p className="budgets-compare-intro">Compara las propuestas de los profesionales para tu solicitud #{requestId}.</p>

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
                  {isCheapest ? <span className="budget-best-badge">Mas economico</span> : null}
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

              <button className="request-save-action" type="button" disabled title="Disponible en el siguiente paso">
                Aceptar presupuesto
              </button>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
