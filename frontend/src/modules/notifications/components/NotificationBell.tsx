import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNotifications, getUnreadCount, markAllRead } from "../services/notificationsApi";
import type { NotificationItem } from "../types/notification";

const POLL_INTERVAL_MS = 30000;

// Segun el tipo de notificacion y sus datos, a que pantalla debe llevar el clic.
function resolveNotificationLink(notification: NotificationItem): string | null {
  const data = notification.data ?? {};
  const requestId = Number((data as { serviceRequestId?: unknown }).serviceRequestId);
  const hasRequest = Number.isFinite(requestId) && requestId > 0;
  switch (notification.type) {
    case "OPPORTUNITY_AVAILABLE":
      return hasRequest ? `/profesional/oportunidades/${requestId}` : "/profesional/oportunidades";
    case "BUDGET_RECEIVED":
      return hasRequest ? `/cliente/solicitudes/${requestId}/presupuestos` : "/cliente/mis-presupuestos";
    case "BUDGET_ACCEPTED":
      return "/profesional/trabajos";
    case "REVIEW_RECEIVED":
      return "/profesional/valoraciones";
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
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
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

  useEffect(() => {
    void refreshUnreadCount();
    const intervalId = setInterval(() => {
      void refreshUnreadCount();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

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
      const items = await getNotifications();
      setNotifications(items);

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
        aria-label={unreadCount > 0 ? `Notificaciones, ${unreadCount} sin leer` : "Notificaciones"}
        aria-expanded={isOpen}
        onClick={() => void handleToggle()}
      >
        <Bell size={20} />
        {unreadCount > 0 ? <span className="notification-bell-badge">{unreadCount > 9 ? "9+" : unreadCount}</span> : null}
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
