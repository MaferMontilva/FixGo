import { useEffect, useRef } from "react";
import type { RequestUrgency } from "../types/serviceRequest";

type ReviewStepProps = {
  budgetMax: number | null;
  budgetMin: number | null;
  categoryName: string;
  description: string;
  flexibleSchedule: boolean;
  locationDescription: string;
  onEditDescription: () => void;
  onEditService: () => void;
  onEditWorkDetails: () => void;
  preferredDateFrom: string;
  preferredDateTo: string;
  serviceName: string | null;
  title: string;
  urgency: RequestUrgency;
};

const urgencyLabels: Record<RequestUrgency, string> = {
  LOW: "Baja",
  NORMAL: "Normal",
  HIGH: "Alta",
  EMERGENCY: "Emergencia"
};

function formatDateForSpain(dateValue: string) {
  if (!dateValue) return "";

  const [year, month, day] = dateValue.split("-");
  if (!year || !month || !day) return dateValue;

  return `${day}/${month}/${year}`;
}

function formatPriceRange(min: number | null, max: number | null) {
  if (typeof min !== "number" || typeof max !== "number" || min <= 0 || max <= 0 || min > max) return "";

  return `${min} EUR - ${max} EUR`;
}

export function ReviewStep({
  budgetMax,
  budgetMin,
  categoryName,
  description,
  flexibleSchedule,
  locationDescription,
  onEditDescription,
  onEditService,
  onEditWorkDetails,
  preferredDateFrom,
  preferredDateTo,
  serviceName,
  title,
  urgency
}: ReviewStepProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const formattedDateFrom = formatDateForSpain(preferredDateFrom);
  const formattedDateTo = formatDateForSpain(preferredDateTo);
  const formattedPriceRange = formatPriceRange(budgetMin, budgetMax);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="request-step-panel review-panel">
      <div className="request-step-heading">
        <h2 ref={headingRef} tabIndex={-1}>Revisa tu solicitud</h2>
        <p>Comprueba que la información sea correcta antes de continuar.</p>
      </div>

      <section className="review-card" aria-labelledby="review-service-title">
        <div className="review-card-header">
          <h3 id="review-service-title">Servicio</h3>
          <button className="review-edit-button" onClick={onEditService} type="button">
            Editar servicio
          </button>
        </div>
        <dl className="review-details">
          <div>
            <dt>Categoría</dt>
            <dd>{categoryName}</dd>
          </div>
          <div>
            <dt>Servicio</dt>
            <dd>{serviceName || "Sin servicio específico"}</dd>
          </div>
        </dl>
      </section>

      <section className="review-card" aria-labelledby="review-description-title">
        <div className="review-card-header">
          <h3 id="review-description-title">Descripción</h3>
          <button className="review-edit-button" onClick={onEditDescription} type="button">
            Editar descripción
          </button>
        </div>
        <dl className="review-details">
          <div>
            <dt>Título</dt>
            <dd>{title.trim() || "Sin título adicional"}</dd>
          </div>
          <div>
            <dt>Detalle</dt>
            <dd className="review-description-text">{description}</dd>
          </div>
        </dl>
      </section>

      <section className="review-card" aria-labelledby="review-work-title">
        <div className="review-card-header">
          <h3 id="review-work-title">Datos del trabajo</h3>
          <button className="review-edit-button" onClick={onEditWorkDetails} type="button">
            Editar datos del trabajo
          </button>
        </div>
        <dl className="review-details">
          <div>
            <dt>Ubicación general</dt>
            <dd>{locationDescription}</dd>
          </div>
          <div>
            <dt>Urgencia</dt>
            <dd>{urgencyLabels[urgency]}</dd>
          </div>
          <div>
            <dt>Disponibilidad</dt>
            <dd>
              {flexibleSchedule ? "Horario flexible" : "Horario con fechas preferidas"}
              {formattedDateFrom ? <span>Fecha inicial: {formattedDateFrom}</span> : null}
              {formattedDateTo ? <span>Fecha final: {formattedDateTo}</span> : null}
            </dd>
          </div>
        </dl>
      </section>

      {formattedPriceRange ? (
        <section className="review-card" aria-labelledby="review-ai-price-title">
          <div className="review-card-header">
            <h3 id="review-ai-price-title">Precio orientativo de FixGo IA</h3>
          </div>
          <div className="review-ai-price">
            <strong>{formattedPriceRange}</strong>
            <p>Este valor es referencial. El precio final dependera del diagnostico, los materiales, el desplazamiento y los presupuestos enviados por los profesionales.</p>
          </div>
        </section>
      ) : null}

    </div>
  );
}
