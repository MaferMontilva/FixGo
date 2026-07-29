import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";
import { getClientOrders } from "../../service-orders";
import { getProfessionalOpportunities } from "../../professionals";
import { getMyBudgets } from "../../budgets";
import { getNotifications, getUnreadCount, markAllRead } from "../services/notificationsApi";
import type { NotificationItem } from "../types/notification";

const POLL_INTERVAL_MS = 30000;

// Aviso persistente que NO vive en la base de datos: se deriva del estado real de los
// trabajos del cliente. Mientras haya un trabajo terminado sin confirmar, este aviso
// aparece en la campana y cuenta en el badge, aunque el cliente ya la haya abierto.
function buildPendingConfirmationNotifications(
  orders: { id: number; requestTitle: string | null; serviceRequestId: number }[]
): NotificationItem[] {
  return orders.map((order) => ({
    // Id negativo para no chocar nunca con las notificaciones reales de la BD.
    id: -order.id,
    type: "WORK_AWAITING_CONFIRMATION",
    title: "Trabajo terminado sin cerrar",
    body: `“${order.requestTitle ?? "Tu servicio"}” está terminado. Confírmalo y déjale tu valoración para cerrar el proceso.`,
    data: { serviceOrderId: order.id, serviceRequestId: order.serviceRequestId },
    status: "SENT",
    createdAt: new Date().toISOString(),
    readAt: null
  }));
}

// Oportunidades compatibles abiertas que el profesional aún no ha presupuestado.
// Se derivan en vivo (no dependen del momento de publicación), así cualquier
// profesional —nuevo o recién activado— ve el punto rojo mientras tenga oportunidades.
function buildOpportunityNotifications(
  opportunities: { id: number; title: string | null }[]
): NotificationItem[] {
  return opportunities.slice(0, 12).map((opp) => ({
    id: -(1_000_000 + opp.id),
    type: "OPPORTUNITY_AVAILABLE",
    title: "Nueva oportunidad",
    body: `“${opp.title ?? "Una solicitud"}” coincide con tu perfil y zona. Envía tu presupuesto antes de que la tomen.`,
    data: { serviceRequestId: opp.id },
    status: "SENT",
    createdAt: new Date().toISOString(),
    readAt: null
  }));
}

// Segun el tipo de notificacion y sus datos, a que pantalla debe llevar el clic.
function resolveNotificationLink(notification: NotificationItem): string | null {
  const data = notification.data ?? {};
  const requestId = Number((data as { serviceRequestId?: unknown }).serviceRequestId);
  const hasRequest = Number.isFinite(requestId) && requestId > 0;
  const orderId = Number((data as { serviceOrderId?: unknown }).serviceOrderId);
  const hasOrder = Number.isFinite(orderId) && orderId > 0;
  // Al abrir el trabajo concreto, la pantalla de Servicios contratados despliega su
  // ventana de detalle, donde el cliente confirma y deja su valoración directamente.
  const orderLink = hasOrder ? `/cliente/trabajos?orderId=${orderId}` : "/cliente/trabajos";
  switch (notification.type) {
    case "OPPORTUNITY_AVAILABLE":
      return hasRequest ? `/profesional/oportunidades/${requestId}` : "/profesional/oportunidades";
    case "BUDGET_RECEIVED":
      return hasRequest ? `/cliente/solicitudes/${requestId}/presupuestos` : "/cliente/mis-presupuestos";
    case "BUDGET_ACCEPTED":
      return "/profesional/trabajos";
    case "BUDGET_NOT_SELECTED":
      return "/profesional/presupuestos";
    case "REVIEW_RECEIVED":
      return "/profesional/valoraciones";
    case "WORK_STARTED":
    case "WORK_COMPLETED":
    case "WORK_AWAITING_CONFIRMATION":
    case "REVIEW_REPLY":
      return orderLink;
    default:
      return null;
  }
}

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return "Ahora mismo";
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `Hace ${diffDays} d`;

  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}

export function NotificationBell() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isClient = Boolean(user?.roles.includes("CLIENT"));
  const isProfessional = Boolean(user?.roles.includes("PROFESSIONAL"));
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingConfirmations, setPendingConfirmations] = useState<NotificationItem[]>([]);
  const [pendingOpportunities, setPendingOpportunities] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const refreshUnreadCount = async () => {
    try {
      const result = await getUnreadCount();
      setUnreadCount(result.count);
    } catch {
      // Silenciamos errores de polling para no interrumpir la navegacion.
    }
  };

  // Trabajos terminados que el cliente aún no confirma. Se recalcula en cada sondeo,
  // así que el aviso sigue en la campana hasta que el cliente cierre el proceso.
  const refreshPendingConfirmations = async (): Promise<NotificationItem[]> => {
    if (!isClient) return [];
    try {
      const orders = await getClientOrders();
      const awaiting = orders.filter((order) => order.status === "AWAITING_CLIENT_CONFIRMATION");
      const built = buildPendingConfirmationNotifications(awaiting);
      setPendingConfirmations(built);
      return built;
    } catch {
      // Silenciamos errores de polling.
      return pendingConfirmations;
    }
  };

  // Oportunidades compatibles abiertas que el profesional aún no ha presupuestado.
  const refreshPendingOpportunities = async (): Promise<NotificationItem[]> => {
    if (!isProfessional) return [];
    try {
      const [opportunities, myBudgets] = await Promise.all([getProfessionalOpportunities(), getMyBudgets()]);
      const quotedRequestIds = new Set(myBudgets.map((budget) => budget.serviceRequestId));
      const pending = opportunities.filter((opp) => !quotedRequestIds.has(opp.id));
      const built = buildOpportunityNotifications(pending);
      setPendingOpportunities(built);
      return built;
    } catch {
      return pendingOpportunities;
    }
  };

  useEffect(() => {
    void refreshUnreadCount();
    void refreshPendingConfirmations();
    void refreshPendingOpportunities();
    const intervalId = setInterval(() => {
      void refreshUnreadCount();
      void refreshPendingConfirmations();
      void refreshPendingOpportunities();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, isProfessional]);

  // El badge suma las no leídas reales + los procesos sin cerrar del cliente +
  // las oportunidades compatibles del profesional (avisos en vivo que no se borran al abrir).
  const badgeCount = unreadCount + pendingConfirmations.length + pendingOpportunities.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleToggle = async () => {
    const nextIsOpen = !isOpen;
    setIsOpen(nextIsOpen);

    if (!nextIsOpen) return;

    setLoading(true);
    try {
      const [pending, opps] = await Promise.all([refreshPendingConfirmations(), refreshPendingOpportunities()]);
      const items = await getNotifications();
      // Para el profesional, las oportunidades reales almacenadas se sustituyen por el
      // aviso en vivo (siempre al día), evitando duplicados en el panel.
      const filtered = isProfessional ? items.filter((item) => item.type !== "OPPORTUNITY_AVAILABLE") : items;
      // Orden: avisos de acción pendiente del cliente, luego las notificaciones reales
      // (p. ej. "Te seleccionaron"), y por último las oportunidades para presupuestar.
      setNotifications([...pending, ...filtered, ...opps]);

      if (unreadCount > 0) {
        await markAllRead();
        setUnreadCount(0);
      }
    } catch {
      // Si falla la carga dejamos el panel abierto vacio en vez de romper la UI.
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNotification = (notification: NotificationItem) => {
    const link = resolveNotificationLink(notification);
    if (!link) return;
    setIsOpen(false);
    navigate(link);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setUnreadCount(0);
    } catch {
      // Ignoramos errores: el usuario puede reintentar mas tarde.
    }
  };

  return (
    <div className="notification-bell" ref={containerRef}>
      <button
        type="button"
        className="notification-bell-trigger"
        aria-label={badgeCount > 0 ? `Notificaciones, ${badgeCount} sin leer` : "Notificaciones"}
        aria-expanded={isOpen}
        onClick={() => void handleToggle()}
      >
        <Bell size={20} />
        {badgeCount > 0 ? <span className="notification-bell-badge">{badgeCount > 9 ? "9+" : badgeCount}</span> : null}
      </button>

      {isOpen ? (
        <div className="notification-panel" role="dialog" aria-label="Notificaciones recientes">
          <div className="notification-panel-header">
            <strong>Notificaciones</strong>
            <button type="button" className="notification-mark-all" onClick={() => void handleMarkAllRead()}>
              Marcar todo como leido
            </button>
          </div>
          <div className="notification-panel-list">
            {loading ? <p className="notification-empty">Cargando...</p> : null}
            {!loading && notifications.length === 0 ? <p className="notification-empty">No tienes notificaciones.</p> : null}
            {!loading &&
              notifications.map((notification) => {
                const link = resolveNotificationLink(notification);
                if (link) {
                  return (
                    <button
                      type="button"
                      className="notification-item notification-item-clickable"
                      key={notification.id}
                      onClick={() => handleOpenNotification(notification)}
                    >
                      <strong>{notification.title}</strong>
                      <p>{notification.body}</p>
                      <span className="notification-item-cta">{formatRelativeTime(notification.createdAt)} · Ver</span>
                    </button>
                  );
                }
                return (
                  <article className="notification-item" key={notification.id}>
                    <strong>{notification.title}</strong>
                    <p>{notification.body}</p>
                    <span>{formatRelativeTime(notification.createdAt)}</span>
                  </article>
                );
              })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
