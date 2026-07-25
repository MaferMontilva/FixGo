import { useEffect, useRef } from "react";

type RequestSubmissionResultProps = {
  requestId: number;
  onCreateAnother: () => void;
  onGoToBudgets: () => void;
};

export function RequestSubmissionResult({
  requestId,
  onCreateAnother,
  onGoToBudgets
}: RequestSubmissionResultProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

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
      </dl>
      <div className="request-submission-result-actions">
        <button className="request-publish-action" onClick={onGoToBudgets} type="button">
          Ir a Mis presupuestos
        </button>
        <button className="request-save-action" onClick={onCreateAnother} type="button">
          Crear otra solicitud
        </button>
      </div>
    </section>
  );
}
