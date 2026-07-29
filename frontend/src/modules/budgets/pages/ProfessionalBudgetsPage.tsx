import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ProfessionalNav } from "../../professionals";
import type { ApiError } from "../../../shared/types/apiError";
import { getMyBudgets } from "../services/budgetsApi";
import type { Budget, BudgetStatus } from "../types/budget";

const statusLabels: Record<BudgetStatus, string> = {
  DRAFT: "Borrador",
  SENT: "Enviado",
  VIEWED: "Visto por el cliente",
  ACCEPTED: "Aceptado",
  REJECTED: "No seleccionado",
  WITHDRAWN: "Retirado",
  EXPIRED: "Caducado"
};

export function ProfessionalBudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setBudgets(await getMyBudgets());
      setError("");
    } catch (loadError) {
      setError((loadError as ApiError).message || "No pudimos cargar tus presupuestos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="pro-dashboard-shell">
      <ProfessionalNav />
      <section className="pro-panel">
        <div className="orders-head">
          <div>
            <h1 className="pro-section-title">Mis presupuestos enviados</h1>
            <p className="pro-helper-text">Aqui ves los presupuestos que has enviado y su estado.</p>
          </div>
          <button className="pro-link-button" type="button" onClick={() => void load()}>
            <RefreshCw size={18} /> Actualizar
          </button>
        </div>

        {loading ? <p className="pro-empty-state">Cargando...</p> : null}
        {error ? <p className="pro-page-error" role="alert">{error}</p> : null}
        {!loading && !error && budgets.length === 0 ? (
          <p className="pro-empty-state">Aun no has enviado presupuestos. Ve a Oportunidades y envia el primero.</p>
        ) : null}

        <div className="opp-list">
          {budgets.map((budget) => (
            <article className="opp-card" key={budget.id}>
              <div className="opp-card-main">
                <div className="opp-card-top">
                  <span className="opp-badge">Solicitud #{budget.serviceRequestId}</span>
                </div>
                <h3>Tu presupuesto</h3>
                <ul className="budget-card-items">
                  {budget.items.map((item) => (
                    <li key={item.id}>
                      <span>{item.description}</span>
                      <span>{item.quantity} × {item.unitPrice.toFixed(2)} = {item.total.toFixed(2)} {budget.currency}</span>
                    </li>
                  ))}
                </ul>
                {budget.observations ? <p className="budget-card-notes">{budget.observations}</p> : null}
              </div>
              <div className="opp-card-side">
                <span className={`order-status status-${budget.status === "ACCEPTED" ? "COMPLETED" : budget.status === "REJECTED" ? "CANCELLED" : "IN_PROGRESS"}`}>
                  {statusLabels[budget.status]}
                </span>
                <div className="opp-price">{budget.totalPrice.toFixed(2)} {budget.currency}</div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
