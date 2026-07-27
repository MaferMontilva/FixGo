import { CheckCircle2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Card } from "../../../shared/components/Card";
import { PageContainer } from "../../../shared/components/PageContainer";
import type { ApiError } from "../../../shared/types/apiError";
import { confirmOrder, getClientOrders } from "../services/serviceOrdersApi";
import type { ServiceOrder, ServiceOrderStatus } from "../types/serviceOrder";

const statusLabels: Record<ServiceOrderStatus, string> = {
  PENDING_START: "Pendiente de inicio",
  SCHEDULED: "Programado",
  PROFESSIONAL_EN_ROUTE: "Profesional en camino",
  IN_PROGRESS: "En progreso",
  PAUSED: "En pausa",
  AWAITING_CLIENT_CONFIRMATION: "Esperando tu confirmacion",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado"
};

export function ClientOrdersPage() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setOrders(await getClientOrders());
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

  const confirm = async (order: ServiceOrder) => {
    try {
      setActionId(order.id);
      await confirmOrder(order.id);
      await load();
    } catch (confirmError) {
      setError((confirmError as ApiError).message || "No pudimos confirmar el trabajo.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <PageContainer className="orders-shell">
      <div className="orders-head">
        <div>
          <h1 className="orders-title">Mis trabajos</h1>
          <p className="orders-intro">Sigue el estado de los trabajos que has contratado.</p>
        </div>
        <button className="request-save-action" type="button" onClick={() => void load()}>
          <RefreshCw size={18} /> Actualizar
        </button>
      </div>

      {loading ? <p className="orders-empty">Cargando...</p> : null}
      {error ? <p className="form-error server-error">{error}</p> : null}
      {!loading && !error && orders.length === 0 ? (
        <Card className="orders-empty-card"><p>Todavia no tienes trabajos contratados. Cuando aceptes un presupuesto, apareceran aqui.</p></Card>
      ) : null}

      <div className="orders-list">
        {orders.map((order) => (
          <Card className="order-card" key={order.id}>
            <div className="order-card-head">
              <h2>{order.requestTitle || `Solicitud #${order.serviceRequestId}`}</h2>
              <span className={`order-status status-${order.status}`}>{statusLabels[order.status]}</span>
            </div>
            {order.requestDescription ? <p className="order-card-desc">{order.requestDescription}</p> : null}
            <dl className="order-card-meta">
              <div><dt>Profesional</dt><dd>{order.professionalName ?? "Profesional"}</dd></div>
              <div><dt>Importe</dt><dd>{order.totalPrice != null ? `${order.totalPrice.toFixed(2)} ${order.currency ?? "EUR"}` : "-"}</dd></div>
            </dl>
            {order.status === "AWAITING_CLIENT_CONFIRMATION" ? (
              <button className="pro-primary-button" type="button" disabled={actionId === order.id} onClick={() => confirm(order)}>
                <CheckCircle2 size={18} /> {actionId === order.id ? "Confirmando..." : "Confirmar trabajo completado"}
              </button>
            ) : null}
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
