import { Award, CheckCircle2, Crown, Droplet, KeyRound, Medal, Paintbrush, Phone, RefreshCw, Sparkles, Sprout, Truck, User, Wallet, Wrench, X, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PageContainer } from "../../../shared/components/PageContainer";
import type { ApiError } from "../../../shared/types/apiError";
import { confirmOrder, getClientOrders } from "../services/serviceOrdersApi";
import { ReviewForm } from "../../reviews";
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

// Icono segun el oficio del profesional (se deduce del nombre/negocio y el titulo).
function iconForOrder(order: ServiceOrder): LucideIcon {
  const text = `${order.professionalName ?? ""} ${order.requestTitle ?? ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  if (text.includes("mudanz")) return Truck;
  if (text.includes("electr")) return Zap;
  if (text.includes("fontan") || text.includes("plomer")) return Droplet;
  if (text.includes("pintur")) return Paintbrush;
  if (text.includes("cerraj")) return KeyRound;
  if (text.includes("limpiez")) return Sparkles;
  if (text.includes("jardin")) return Sprout;
  return Wrench; // manitas y genericos
}

// Insignia de cliente segun cuantos servicios ha contratado (para motivar).
function clientTier(count: number): { label: string; className: string; Icon: LucideIcon; next: string | null } {
  if (count >= 10) return { label: "Cliente Élite", className: "tier-elite", Icon: Crown, next: null };
  if (count >= 5) return { label: "Cliente Pro", className: "tier-pro", Icon: Medal, next: `Contrata ${10 - count} servicios más para ser Cliente Élite` };
  if (count >= 2) return { label: "Cliente Junior", className: "tier-junior", Icon: Award, next: `Contrata ${5 - count} servicios más para ser Cliente Pro` };
  return { label: "Cliente nuevo", className: "tier-new", Icon: Sparkles, next: `Contrata ${Math.max(0, 2 - count)} servicio(s) más para ser Cliente Junior` };
}

export function ClientOrdersPage() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<number | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setOrders(await getClientOrders());
      setError("");
    } catch (loadError) {
      setError((loadError as ApiError).message || "No pudimos cargar tus servicios.");
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
      setError((confirmError as ApiError).message || "No pudimos confirmar el servicio.");
    } finally {
      setActionId(null);
    }
  };

  const formatAmount = (order: ServiceOrder) =>
    order.totalPrice != null ? `${order.totalPrice.toFixed(2)} ${order.currency ?? "EUR"}` : "-";

  const detailOrder = orders.find((order) => order.id === detailId) ?? null;

  return (
    <PageContainer className="orders-shell">
      <div className="orders-head">
        <div>
          <div className="orders-title-line">
            <h1 className="orders-title">Servicios contratados</h1>
            {(() => {
              const tier = clientTier(orders.length);
              return (
                <span className={`client-tier-badge ${tier.className}`} title={tier.next ?? "Has alcanzado el nivel máximo"}>
                  <tier.Icon size={15} /> {tier.label}
                </span>
              );
            })()}
          </div>
          <p className="orders-intro">Sigue el estado de los servicios que has contratado y confírmalos al terminar.</p>
        </div>
        <button className="request-save-action" type="button" onClick={() => void load()}>
          <RefreshCw size={18} /> Actualizar
        </button>
      </div>

      {loading ? <p className="orders-empty">Cargando...</p> : null}
      {error ? <p className="form-error server-error">{error}</p> : null}
      {!loading && !error && orders.length === 0 ? (
        <p className="orders-empty">Todavía no tienes servicios contratados. Cuando aceptes un presupuesto, aparecerán aquí.</p>
      ) : null}

      <div className="orders-list">
        {orders.map((order) => {
          const OrderIcon = iconForOrder(order);
          return (
          <article className="order-row" key={order.id}>
            <span className="crc-cat-icon"><OrderIcon size={20} /></span>
            <div className="order-row-info">
              <div className="order-row-titleline">
                <h2>{order.requestTitle || `Solicitud #${order.serviceRequestId}`}</h2>
                <span className={`order-status status-${order.status}`}>{statusLabels[order.status]}</span>
              </div>
              <div className="order-row-meta">
                <span><User size={15} /> {order.professionalName ?? "Profesional"}</span>
                <span><Wallet size={15} /> {formatAmount(order)}</span>
              </div>
            </div>
            <button className="order-ver-btn" type="button" onClick={() => setDetailId(order.id)}>Ver</button>
          </article>
          );
        })}
      </div>

      {detailOrder ? (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true" onClick={() => setDetailId(null)}>
          <div className="order-detail-modal" onClick={(event) => event.stopPropagation()}>
            <button className="order-detail-close" type="button" aria-label="Cerrar" onClick={() => setDetailId(null)}><X size={20} /></button>
            <div className="order-detail-head">
              <span className="crc-cat-icon">{(() => { const DetailIcon = iconForOrder(detailOrder); return <DetailIcon size={20} />; })()}</span>
              <div>
                <h2>{detailOrder.requestTitle || `Solicitud #${detailOrder.serviceRequestId}`}</h2>
                <span className={`order-status status-${detailOrder.status}`}>{statusLabels[detailOrder.status]}</span>
              </div>
            </div>

            {detailOrder.requestDescription ? <p className="order-card-desc">{detailOrder.requestDescription}</p> : null}

            <div className="order-card-meta">
              <div className="order-meta-item">
                <span className="crf-ic"><User size={17} /></span>
                <div className="crf-text"><dt>Profesional</dt><dd>{detailOrder.professionalName ?? "Profesional"}</dd></div>
              </div>
              <div className="order-meta-item">
                <span className="crf-ic"><Wallet size={17} /></span>
                <div className="crf-text"><dt>Importe</dt><dd>{formatAmount(detailOrder)}</dd></div>
              </div>
            </div>

            <div className="order-contact-box">
              <span className="order-contact-icon"><Phone size={18} /></span>
              <div>
                <dt>Contacto del profesional</dt>
                <dd>
                  {detailOrder.professionalPhone ? (
                    <a href={`tel:${detailOrder.professionalPhone}`}>{detailOrder.professionalPhone}</a>
                  ) : (
                    "Se mostrará al iniciar el servicio"
                  )}
                </dd>
                <p className="order-contact-note">Datos de contacto disponibles porque aceptaste este presupuesto.</p>
              </div>
            </div>

            {detailOrder.status === "AWAITING_CLIENT_CONFIRMATION" ? (
              <button className="pro-primary-button" type="button" disabled={actionId === detailOrder.id} onClick={() => confirm(detailOrder)}>
                <CheckCircle2 size={18} /> {actionId === detailOrder.id ? "Confirmando..." : "Confirmar servicio completado"}
              </button>
            ) : null}
            {detailOrder.status === "COMPLETED" && !detailOrder.hasReview ? (
              <ReviewForm serviceOrderId={detailOrder.id} onSubmitted={() => void load()} />
            ) : null}
            {detailOrder.status === "COMPLETED" && detailOrder.hasReview ? (
              <p className="review-done">Ya valoraste este servicio. ¡Gracias!</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}
