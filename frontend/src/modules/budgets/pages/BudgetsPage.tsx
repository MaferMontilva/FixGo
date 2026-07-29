import { AlertTriangle, BellRing, Calendar, ClipboardList, Coins, Home, Layers, MapPin, PlusCircle, Wrench, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/Button";
import { Card } from "../../../shared/components/Card";
import { PageContainer } from "../../../shared/components/PageContainer";
import type { ApiError } from "../../../shared/types/apiError";
import { getCategories } from "../../categories";
import type { UiCategory } from "../../categories";
import { getServices } from "../../services";
import type { ApiService } from "../../services";
import {
  cancelMyServiceRequest,
  duplicateCancelledServiceRequestAsDraft,
  getMyServiceRequestDetail,
  getMyServiceRequests,
  hideMyServiceRequest
} from "../../service-requests";
import type {
  RequestUrgency,
  ServiceRequestResponse,
  ServiceRequestStatus
} from "../../service-requests";

const statusLabels: Record<string, string> = {
  AI_PROCESSING: "Procesando con IA",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
  DRAFT: "Borrador",
  EXPIRED: "Expirada",
  IN_PROGRESS: "En progreso",
  PROFESSIONAL_SELECTED: "Profesional seleccionado",
  PUBLISHED: "Publicada",
  READY_TO_PUBLISH: "Lista para publicar",
  RECEIVING_BUDGETS: "Recibiendo presupuestos"
};

const urgencyLabels: Record<RequestUrgency, string> = {
  EMERGENCY: "Emergencia",
  HIGH: "Alta",
  LOW: "Baja",
  NORMAL: "Normal"
};

function getStatusLabel(status: ServiceRequestStatus) {
  return statusLabels[status] ?? status.replace(/_/g, " ").toLowerCase();
}

function canCancel(status: ServiceRequestStatus) {
  return status === "DRAFT" || status === "PUBLISHED";
}

function canHide(status: ServiceRequestStatus) {
  return status === "DRAFT" || status === "CANCELLED";
}

function formatDate(value?: string | null) {
  if (!value) return "Sin fecha";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function getErrorMessage(error: unknown) {
  const apiError = error as Partial<ApiError>;

  if (apiError.status === 401) return "Tu sesión ha caducado.";
  if (apiError.status === 403) return "No tienes permisos para realizar esta acción.";
  if (apiError.status === 404) return "No encontramos la solicitud.";
  if (apiError.status === 409) return "La solicitud ya no permite esta acción.";

  return "No se pudo conectar con FixGo.";
}

function getShortDescription(description: string) {
  const cleanDescription = description.trim();
  return cleanDescription.length > 160 ? `${cleanDescription.slice(0, 157)}...` : cleanDescription;
}

function formatAvailability(request: ServiceRequestResponse) {
  if (request.flexibleSchedule) return "Horario flexible";
  if (request.preferredDateFrom && request.preferredDateTo) {
    return `Del ${formatDate(request.preferredDateFrom)} al ${formatDate(request.preferredDateTo)}`;
  }
  if (request.preferredDateFrom) return `Desde ${formatDate(request.preferredDateFrom)}`;
  if (request.preferredDateTo) return `Hasta ${formatDate(request.preferredDateTo)}`;

  return "Sin fechas preferidas";
}

function formatAiPriceRange(request: ServiceRequestResponse) {
  const { budgetMin, budgetMax } = request;
  if (typeof budgetMin !== "number" || typeof budgetMax !== "number" || budgetMin <= 0 || budgetMax <= 0 || budgetMin > budgetMax) return "";

  return `${budgetMin} EUR - ${budgetMax} EUR`;
}

export function BudgetsPage() {
  const navigate = useNavigate();
  const detailHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const [requests, setRequests] = useState<ServiceRequestResponse[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestResponse | null>(null);
  const [categories, setCategories] = useState<UiCategory[]>([]);
  const [services, setServices] = useState<ApiService[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoadingId, setDetailLoadingId] = useState<number | null>(null);
  const [cancelLoadingId, setCancelLoadingId] = useState<number | null>(null);
  const [duplicateLoadingId, setDuplicateLoadingId] = useState<number | null>(null);
  const [hideLoadingId, setHideLoadingId] = useState<number | null>(null);
  const [hideCandidate, setHideCandidate] = useState<ServiceRequestResponse | null>(null);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPageData() {
      try {
        setLoading(true);
        setError("");
        const [nextRequests, nextCategories, nextServices] = await Promise.all([
          getMyServiceRequests(),
          getCategories(),
          getServices()
        ]);

        if (!active) return;
        setRequests(nextRequests);
        setCategories(nextCategories);
        setServices(nextServices);
      } catch (loadError) {
        if (active) setError(getErrorMessage(loadError));
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPageData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (selectedRequest) detailHeadingRef.current?.focus();
  }, [selectedRequest]);

  const categoryById = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category.name]));
  }, [categories]);

  const serviceById = useMemo(() => {
    return new Map(services.map((service) => [service.id, service.name]));
  }, [services]);

  // Solicitudes con un profesional trabajando ahora mismo. El aviso permanece visible
  // mientras sigan en curso, para recordar al cliente que debe cerrar el proceso.
  const inProgressRequests = useMemo(
    () => requests.filter((request) => request.status === "IN_PROGRESS"),
    [requests]
  );

  const refreshRequest = (request: ServiceRequestResponse) => {
    setRequests((current) => current.map((item) => (item.id === request.id ? request : item)));
    setSelectedRequest((current) => (current?.id === request.id ? request : current));
  };

  const openDetail = async (id: number) => {
    try {
      setDetailLoadingId(id);
      setActionMessage("");
      setError("");
      setSelectedRequest(await getMyServiceRequestDetail(id));
    } catch (detailError) {
      setError(getErrorMessage(detailError));
    } finally {
      setDetailLoadingId(null);
    }
  };

  const cancelRequest = async (request: ServiceRequestResponse) => {
    if (!canCancel(request.status)) return;
    if (!window.confirm("¿Quieres cancelar esta solicitud?")) return;

    try {
      setCancelLoadingId(request.id);
      setActionMessage("");
      setError("");
      const cancelledRequest = await cancelMyServiceRequest(request.id);
      refreshRequest(cancelledRequest);
      setActionMessage(`La solicitud #${cancelledRequest.id} fue cancelada.`);
    } catch (cancelError) {
      setError(getErrorMessage(cancelError));
    } finally {
      setCancelLoadingId(null);
    }
  };

  const duplicateCancelledRequest = async (request: ServiceRequestResponse) => {
    if (request.status !== "CANCELLED" || duplicateLoadingId) return;

    try {
      setDuplicateLoadingId(request.id);
      setActionMessage("");
      setError("");
      const draft = await duplicateCancelledServiceRequestAsDraft(request.id);
      navigate(`/cliente/solicitar-presupuesto?draftId=${draft.id}`);
    } catch (duplicateError) {
      setError(getErrorMessage(duplicateError));
    } finally {
      setDuplicateLoadingId(null);
    }
  };

  const confirmHideRequest = async () => {
    if (!hideCandidate || hideLoadingId) return;

    try {
      setHideLoadingId(hideCandidate.id);
      setActionMessage("");
      setError("");
      await hideMyServiceRequest(hideCandidate.id);
      setRequests((current) => current.filter((request) => request.id !== hideCandidate.id));
      setSelectedRequest((current) => (current?.id === hideCandidate.id ? null : current));
      setHideCandidate(null);
      setActionMessage("✓ Solicitud ocultada de tu lista");
    } catch (hideError) {
      setError(getErrorMessage(hideError));
    } finally {
      setHideLoadingId(null);
    }
  };

  const getCategoryName = (request: ServiceRequestResponse) => {
    return request.categoryId ? categoryById.get(request.categoryId) ?? "Categoría no disponible" : "Sin categoría";
  };

  const getServiceName = (request: ServiceRequestResponse) => {
    return request.serviceId ? serviceById.get(request.serviceId) ?? "Servicio no disponible" : "Sin servicio específico";
  };

  return (
    <PageContainer className="client-requests-page">
      <section className="client-requests-header">
        <span className="client-requests-kicker">Área del cliente</span>
        <h1>Mis solicitudes</h1>
        <p>Consulta el estado de los trabajos que has solicitado.</p>
      </section>

      <div className="client-requests-feedback" aria-live="polite">
        {loading ? <p>Cargando tus solicitudes...</p> : null}
        {error ? <p className="is-error">{error}</p> : null}
        {actionMessage ? <p>{actionMessage}</p> : null}
      </div>

      {!loading && inProgressRequests.length > 0 ? (
        <div className="orders-pending-banner" role="alert">
          <span className="orders-pending-icon"><BellRing size={20} /></span>
          <div className="orders-pending-text">
            <strong>
              {inProgressRequests.length === 1
                ? "Tienes una solicitud en progreso"
                : `Tienes ${inProgressRequests.length} solicitudes en progreso`}
            </strong>
            <p>
              {inProgressRequests.length === 1
                ? `“${inProgressRequests[0].title?.trim() || `Solicitud #${inProgressRequests[0].id}`}” está en curso. Cuando el profesional termine, confírmala y déjale tu valoración. Este aviso seguirá aquí hasta que cierres el proceso.`
                : "Hay trabajos en curso. Cuando cada profesional termine, deberás confirmarlos y valorarlos. Este aviso seguirá aquí hasta que cierres cada proceso."}
            </p>
          </div>
          <button
            className="orders-pending-cta"
            type="button"
            onClick={() => navigate("/cliente/trabajos")}
          >
            Ir a servicios contratados
          </button>
        </div>
      ) : null}

      {!loading && !error && requests.length === 0 ? (
        <Card className="session-card client-requests-empty">
          <div className="session-icon"><ClipboardList size={42} /></div>
          <h2>Aún no tienes solicitudes.</h2>
          <p>Cuando publiques una solicitud, aparecerá aquí con su estado actualizado.</p>
          <Button to="/cliente/solicitar-presupuesto" variant="wide">
            <PlusCircle size={22} />
            Crear solicitud
          </Button>
        </Card>
      ) : null}

      {requests.length > 0 ? (
        <div className="client-requests-layout">
          <section className="client-requests-list" aria-label="Listado de solicitudes">
            {requests.map((request) => (
              <article className="client-request-card" key={request.id}>
                <div className="client-request-card-header">
                  <div className="crc-title-wrap">
                    <span className="crc-cat-icon"><Home size={20} /></span>
                    <div>
                      <span className="client-request-id">Solicitud #{request.id}</span>
                      <h2>{request.title?.trim() || "Solicitud sin título"}</h2>
                    </div>
                  </div>
                  <span className={`client-request-status status-${request.status.toLowerCase().replace(/_/g, "-")}`}>
                    {getStatusLabel(request.status)}
                  </span>
                </div>
                <dl className="client-request-summary">
                  <div>
                    <span className="crf-ic"><Layers size={16} /></span>
                    <div className="crf-text"><dt>Categoría</dt><dd>{getCategoryName(request)}</dd></div>
                  </div>
                  <div>
                    <span className="crf-ic"><Wrench size={16} /></span>
                    <div className="crf-text"><dt>Servicio</dt><dd>{getServiceName(request)}</dd></div>
                  </div>
                  <div>
                    <span className="crf-ic"><MapPin size={16} /></span>
                    <div className="crf-text"><dt>Ubicación</dt><dd>{request.locationDescription || "Sin ubicación"}</dd></div>
                  </div>
                  <div>
                    <span className="crf-ic"><AlertTriangle size={16} /></span>
                    <div className="crf-text"><dt>Urgencia</dt><dd><span className="crf-urgency">{urgencyLabels[request.urgency]}</span></dd></div>
                  </div>
                  {formatAiPriceRange(request) ? (
                    <div>
                      <span className="crf-ic"><Coins size={16} /></span>
                      <div className="crf-text"><dt>Precio orientativo</dt><dd>{formatAiPriceRange(request)}</dd></div>
                    </div>
                  ) : null}
                  <div>
                    <span className="crf-ic"><Calendar size={16} /></span>
                    <div className="crf-text"><dt>Fecha</dt><dd>{formatDate(request.publishedAt ?? request.createdAt)}</dd></div>
                  </div>
                </dl>
                {getShortDescription(request.originalDescription) ? (
                  <div className="client-request-desc-box">
                    <span className="crf-desc-label">Descripción</span>
                    <p>{getShortDescription(request.originalDescription)}</p>
                  </div>
                ) : null}
                <div className="client-request-actions">
                  {["PUBLISHED", "RECEIVING_BUDGETS", "PROFESSIONAL_SELECTED", "IN_PROGRESS", "COMPLETED"].includes(request.status) ? (
                    <button className="client-request-primary" onClick={() => navigate(`/cliente/solicitudes/${request.id}/presupuestos`)} type="button">
                      <ClipboardList size={18} />
                      Ver presupuestos
                    </button>
                  ) : null}
                  {canCancel(request.status) ? (
                    <button className="client-request-cancel-link" disabled={cancelLoadingId === request.id} onClick={() => cancelRequest(request)} type="button">
                      <XCircle size={17} />
                      {cancelLoadingId === request.id ? "Cancelando..." : "Cancelar"}
                    </button>
                  ) : null}
                  {request.status === "CANCELLED" ? (
                    <button className="request-save-action" disabled={duplicateLoadingId === request.id} onClick={() => duplicateCancelledRequest(request)} type="button">
                      <PlusCircle size={18} />
                      {duplicateLoadingId === request.id ? "Creando..." : "Crear copia editable"}
                    </button>
                  ) : null}
                  {canHide(request.status) ? (
                    <button className="client-request-hide" disabled={hideLoadingId === request.id} onClick={() => setHideCandidate(request)} type="button">
                      {hideLoadingId === request.id ? "Ocultando..." : "Ocultar de mi lista"}
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </section>

          {selectedRequest ? (
            <aside className="client-request-detail" aria-labelledby="request-detail-title">
              <div className="client-request-detail-header">
                <span className="client-request-id">Solicitud #{selectedRequest.id}</span>
                <button className="review-edit-button" onClick={() => setSelectedRequest(null)} type="button">
                  Cerrar detalle
                </button>
              </div>
              <h2 id="request-detail-title" ref={detailHeadingRef} tabIndex={-1}>
                {selectedRequest.title?.trim() || "Solicitud sin título"}
              </h2>
              <dl className="client-request-detail-grid">
                <div>
                  <dt>Categoría</dt>
                  <dd>{getCategoryName(selectedRequest)}</dd>
                </div>
                <div>
                  <dt>Servicio</dt>
                  <dd>{getServiceName(selectedRequest)}</dd>
                </div>
                <div>
                  <dt>Estado</dt>
                  <dd>{getStatusLabel(selectedRequest.status)}</dd>
                </div>
                <div>
                  <dt>Urgencia</dt>
                  <dd>{urgencyLabels[selectedRequest.urgency]}</dd>
                </div>
                <div>
                  <dt>Ubicación</dt>
                  <dd>{selectedRequest.locationDescription || "Sin ubicación"}</dd>
                </div>
                <div>
                  <dt>Disponibilidad</dt>
                  <dd>{formatAvailability(selectedRequest)}</dd>
                </div>
                {formatAiPriceRange(selectedRequest) ? (
                  <div>
                    <dt>Precio orientativo de FixGo IA</dt>
                    <dd>{formatAiPriceRange(selectedRequest)}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Fecha de publicación</dt>
                  <dd>{formatDate(selectedRequest.publishedAt)}</dd>
                </div>
                <div>
                  <dt>Fecha de cancelación</dt>
                  <dd>{formatDate(selectedRequest.cancelledAt)}</dd>
                </div>
              </dl>
              <section className="client-request-detail-description">
                <h3>Descripción completa</h3>
                <p>{selectedRequest.originalDescription}</p>
              </section>
              {formatAiPriceRange(selectedRequest) ? (
                <section className="client-request-detail-description client-request-ai-price">
                  <h3>Precio orientativo de FixGo IA</h3>
                  <strong>{formatAiPriceRange(selectedRequest)}</strong>
                  <p>Este valor es referencial. El precio final dependera del diagnostico, los materiales, el desplazamiento y los presupuestos enviados por los profesionales.</p>
                </section>
              ) : null}
              {selectedRequest.cancellationReason ? (
                <section className="client-request-detail-description">
                  <h3>Motivo de cancelación</h3>
                  <p>{selectedRequest.cancellationReason}</p>
                </section>
              ) : null}
              {selectedRequest.status === "CANCELLED" ? (
                <section className="client-request-detail-description client-request-cancelled-panel">
                  <h3>Esta solicitud fue cancelada</h3>
                  <p>Puedes crear un nuevo borrador con los mismos datos o retirarla de tu lista.</p>
                  <div className="client-request-actions">
                    <button className="request-save-action" disabled={duplicateLoadingId === selectedRequest.id} onClick={() => duplicateCancelledRequest(selectedRequest)} type="button">
                      <PlusCircle size={18} />
                      {duplicateLoadingId === selectedRequest.id ? "Creando..." : "Crear copia editable"}
                    </button>
                    <button className="client-request-hide" disabled={hideLoadingId === selectedRequest.id} onClick={() => setHideCandidate(selectedRequest)} type="button">
                      {hideLoadingId === selectedRequest.id ? "Ocultando..." : "Ocultar de mi lista"}
                    </button>
                    <button className="request-secondary-action" onClick={() => setSelectedRequest(null)} type="button">
                      Volver a mis solicitudes
                    </button>
                  </div>
                </section>
              ) : null}
              {canCancel(selectedRequest.status) ? (
                <button className="client-request-cancel" disabled={cancelLoadingId === selectedRequest.id} onClick={() => cancelRequest(selectedRequest)} type="button">
                  <XCircle size={18} />
                  {cancelLoadingId === selectedRequest.id ? "Cancelando..." : "Cancelar solicitud"}
                </button>
              ) : null}
            </aside>
          ) : null}
        </div>
      ) : null}

      {hideCandidate ? (
        <div className="dialog-backdrop" role="presentation">
          <div aria-labelledby="hide-request-title" aria-modal="true" className="confirm-dialog" role="dialog">
            <h2 id="hide-request-title">Ocultar solicitud</h2>
            <p>La solicitud dejará de aparecer en tu lista, pero conservará su historial. ¿Deseas continuar?</p>
            <div className="confirm-dialog-actions">
              <button className="request-secondary-action" disabled={Boolean(hideLoadingId)} onClick={() => setHideCandidate(null)} type="button">
                Cancelar
              </button>
              <button className="request-secondary-action ai-action-primary" disabled={Boolean(hideLoadingId)} onClick={confirmHideRequest} type="button">
                {hideLoadingId ? "Ocultando..." : "Ocultar solicitud"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}
