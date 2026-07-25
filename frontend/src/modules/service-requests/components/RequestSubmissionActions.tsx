import { useEffect, useRef } from "react";
import type { RequestSubmissionStatus } from "../types/serviceRequest";

type RequestSubmissionActionsProps = {
  message: string;
  onPublish: () => void;
  onSave: () => void;
  status: RequestSubmissionStatus;
};

export function RequestSubmissionActions({
  message,
  onPublish,
  onSave,
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
          {isSaving ? "Guardando..." : "Guardar borrador"}
        </button>
        <button className="request-publish-action" disabled={isBusy} onClick={onPublish} type="button">
          {isPublishing ? "Publicando..." : "Publicar solicitud"}
        </button>
      </div>
    </section>
  );
}
