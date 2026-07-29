import { useEffect, useRef } from "react";
import type { RequestUrgency } from "../types/serviceRequest";

type RequestSubmissionResultProps = {
  budgetMax: number | null;
  budgetMin: number | null;
  urgency: RequestUrgency;
  requestId: number;
  onCreateAnother: () => void;
  onGoToBudgets: () => void;
};

const urgencyLabels: Record<RequestUrgency, string> = {
  LOW: "Baja",
  NORMAL: "Normal",
  HIGH: "Alta",
  EMERGENCY: "Emergencia"
};

export function RequestSubmissionResult({
  budgetMax,
  budgetMin,
  urgency,
  requestId,
  onCreateAnother,
  onGoToBudgets
}: RequestSubmissionResultProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const hasPriceRange = typeof budgetMin === "number" && typeof budgetMax === "number" && budgetMin > 0 && budgetMax > 0 && budgetMin <= budgetMax;

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section className="request-submission-result" aria-live="polite">
      <span className="request-submission-result-kicker">Solicitud enviada</span>
      <h2 ref={headingRef} tabIndex={-1}>Solicitud publicada correctamente</h2>
      <p>Los profesionales compatibles podr&aacute;n consultar tu solicitud.</p>
      <dl className="request-submission-result-details">
        <div>
          <dt>Identificador</dt>
          <dd>#{requestId}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>Publicada</dd>
        </div>
        <div>
          <dt>Urgencia</dt>
          <dd>{urgencyLabels[urgency]}</dd>
        </div>
        {hasPriceRange ? (
          <div>
            <dt>Precio orientativo de FixGo IA</dt>
            <dd>{budgetMin} EUR - {budgetMax} EUR</dd>
          </div>
        ) : null}
      </dl>
      <div className="request-submission-result-actions">
        <button className="request-publish-action" onClick={onGoToBudgets} type="button">
          Ir a mis solicitudes
        </button>
        <button className="request-save-action" onClick={onCreateAnother} type="button">
          Crear otra solicitud
        </button>
      </div>
    </section>
  );
}
