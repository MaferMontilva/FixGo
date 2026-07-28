import { CheckCircle2, PlayCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { completeOrder, getProfessionalOrders, startOrder } from "../services/serviceOrdersApi";
import type { ServiceOrder, ServiceOrderStatus } from "../types/serviceOrder";
import type { ApiError } from "../../../shared/types/apiError";
import { ProfessionalNav } from "../../professionals";

const statusLabels: Record<ServiceOrderStatus, string> = {
  PENDING_START: "Pendiente de inicio",
  SCHEDULED: "Programado",
  PROFESSIONAL_EN_ROUTE: "En camino",
  IN_PROGRESS: "En progreso",
  PAUSED: "En pausa",
  AWAITING_CLIENT_CONFIRMATION: "Esperando confirmacion del cliente",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado"
};

function shortText(text: string, max = 160) {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max).trim()}…` : clean;
}

export function ProfessionalOrdersPage() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setOrders(await getProfessionalOrders());
      setError("");
    } catch (loadError) {
      setError((loadError as ApiError).message || "No pudimos cargar tus trabajos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const runAction = async (order: ServiceOrder, action: (id: number) => Promise<ServiceOrder>) => {
    try {
      setActionId(order.id);
      await action(order.id);
      await load();
    } catch (actionError) {
      setError((actionError as ApiError).message || "No pudimos actualizar el trabajo.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <main className="pro-dashboard-shell">
      <ProfessionalNav />
      <section className="pro-panel">
        <div className="orders-head">
          <div>
            <h1 className="pro-section-title">Mis trabajos</h1>
            <p className="pro-helper-text">Gestiona los trabajos que has ganado: inicia y marca como completados.</p>
          </div>
          <button className="pro-link-button" type="button" onClick={() => void load()}><RefreshCw size={18} /> Actualizar</button>
        </div>

        {loading ? <p className="pro-empty-state">Cargando...</p> : null}
        {error ? <p className="pro-page-error" role="alert">{error}</p> : null}
        {!loading && !error && orders.length === 0 ? <p className="pro-empty-state">Aun no tienes trabajos. Cuando un cliente acepte tu presupuesto, apareceran aqui.</p> : null}

        <div className="opp-list">
          {orders.map((order) => (
            <article className="opp-card" key={order.id}>
              <div className="opp-card-main">
                <div className="opp-card-top">
                  <span className="opp-badge">Trabajo #{order.serviceRequestId}</span>
                </div>
                <h3>{order.requestTitle || `Solicitud #${order.serviceRequestId}`}</h3>
                {order.requestDescription ? <p>{shortText(order.requestDescription)}</p> : null}
              </div>
              <div className="opp-card-side">
                <span className={`order-status status-${order.status}`}>{statusLabels[order.status]}</span>
                <div className="opp-price">{order.totalPrice != null ? `${order.totalPrice.toFixed(2)} ${order.currency ?? "EUR"}` : "-"}</div>
                {["PENDING_START", "SCHEDULED"].includes(order.status) ? (
                  <button className="pro-primary-button" type="button" disabled={actionId === order.id} onClick={() => runAction(order, startOrder)}>
                    <PlayCircle size={18} /> {actionId === order.id ? "Iniciando..." : "Iniciar trabajo"}
                  </button>
                ) : null}
                {order.status === "IN_PROGRESS" ? (
                  <button className="pro-primary-button" type="button" disabled={actionId === order.id} onClick={() => runAction(order, completeOrder)}>
                    <CheckCircle2 size={18} /> {actionId === order.id ? "Guardando..." : "Completar"}
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
