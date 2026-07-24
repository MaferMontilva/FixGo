import { useEffect, useRef, useState } from "react";
import { getDescriptionError } from "../validation/serviceRequestValidation";

type DescriptionStepProps = {
  description: string;
  focusDescription: boolean;
  onDescriptionChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  title: string;
};

const descriptionId = "service-request-description";
const descriptionErrorId = "service-request-description-error";

export function DescriptionStep({
  description,
  focusDescription,
  onDescriptionChange,
  onTitleChange,
  title
}: DescriptionStepProps) {
  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const descriptionError = descriptionTouched ? getDescriptionError(description) : "";

  useEffect(() => {
    if (focusDescription) {
      descriptionRef.current?.focus();
    }
  }, [focusDescription]);

  useEffect(() => {
    if (descriptionTouched && descriptionError) {
      descriptionRef.current?.focus();
    }
  }, [descriptionError, descriptionTouched]);

  const updateDescription = (value: string) => {
    onDescriptionChange(value);
    if (descriptionTouched && !getDescriptionError(value)) {
      setDescriptionTouched(false);
    }
  };

  return (
    <div className="request-step-panel">
      <div className="request-step-heading">
        <h2>Descripción del trabajo</h2>
        <p>Cuéntanos qué ocurre. La descripción puede tener varias líneas y no activa todavía FixGo IA.</p>
      </div>

      <div className="request-form-grid">
        <label className="request-field">
          <span>Título del trabajo</span>
          <input
            maxLength={120}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Ej: Reparar fuga en la cocina"
            value={title}
          />
        </label>

        <label className="request-field request-field-wide" htmlFor={descriptionId}>
          <span>Descripción</span>
          <textarea
            aria-describedby={descriptionError ? descriptionErrorId : undefined}
            aria-invalid={descriptionError ? "true" : "false"}
            id={descriptionId}
            maxLength={2000}
            onBlur={() => setDescriptionTouched(true)}
            onChange={(event) => updateDescription(event.target.value)}
            placeholder="Describe qué necesitas, desde cuándo ocurre y cualquier detalle que pueda ayudar al profesional."
            ref={descriptionRef}
            rows={7}
            value={description}
          />
        </label>
        <div className="request-field-help request-field-wide">
          <span>{description.length}/2000 caracteres</span>
          {descriptionError ? (
            <strong id={descriptionErrorId} role="alert">{descriptionError}</strong>
          ) : null}
        </div>
      </div>

      <p className="request-next-note">Siguiente: datos del trabajo</p>
    </div>
  );
}
