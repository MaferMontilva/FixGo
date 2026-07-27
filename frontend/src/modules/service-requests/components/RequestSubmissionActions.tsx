import { useEffect, useRef } from "react";
import type { RequestSubmissionStatus } from "../types/serviceRequest";

type RequestSubmissionActionsProps = {
  message: string;
  onContinueEditing: () => void;
  onGoHome: () => void;
  onGoToRequests: () => void;
  onPublish: () => void;
  onSave: () => void;
  saveLabel: string;
  status: RequestSubmissionStatus;
};

export function RequestSubmissionActions({
  message,
  onContinueEditing,
  onGoHome,
  onGoToRequests,
  onPublish,
  onSave,
  saveLabel,
  status
}: RequestSubmissionActionsProps) {
  const messageRef = useRef<HTMLParagraphElement | null>(null);
  const isSaving = status === "saving";
  const isPublishing = status === "publishing";
  const isBusy = isSaving || isPublishing;
  const isError = status === "error";

  useEffect(() => {
    if ((isError || status === "saved") && message) {
      messageRef.current?.focus();
    }
  }, [isError, message, status]);

  if (status === "saved") {
    return (
      <section className="request-submission-actions request-draft-saved-panel" aria-live="polite">
        <div>
          <h3>Borrador guardado correctamente</h3>
          <p>Tu solicitud se guardó y puedes continuar editándola o revisarla más tarde desde Mis solicitudes.</p>
        </div>
        <div className="request-submission-buttons">
          <button className="request-save-action" onClick={onContinueEditing} type="button">
            Seguir editando
          </button>
          <button className="request-publish-action" onClick={onGoToRequests} type="button">
            Ver mis solicitudes
          </button>
          <button className="request-secondary-action" onClick={onGoHome} type="button">
            Ir al inicio
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="request-submission-actions" aria-busy={isBusy} aria-live="polite">
      {message ? (
        <p
          className={`request-submission-message${isError ? " is-error" : ""}`}
          ref={messageRef}
          tabIndex={-1}
        >
          {message}
        </p>
      ) : null}
      <div className="request-submission-buttons">
        <button className="request-save-action" disabled={isBusy} onClick={onSave} type="button">
          {isSaving ? "Guardando..." : saveLabel}
        </button>
        <button className="request-publish-action" disabled={isBusy} onClick={onPublish} type="button">
          {isPublishing ? "Publicando..." : "Publicar solicitud"}
        </button>
      </div>
    </section>
  );
}
