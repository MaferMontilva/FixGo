import { useEffect, useRef, useState } from "react";
import type { AiAnalysisStatus, ServiceRequestAiAnalysis } from "../types/serviceRequest";
import { getDescriptionError } from "../validation/serviceRequestValidation";

type DescriptionStepProps = {
  aiAnalysis: ServiceRequestAiAnalysis | null;
  aiApplied: boolean;
  aiHighlightedFields: string[];
  aiPanelMessage: string;
  aiStale: boolean;
  aiStatus: AiAnalysisStatus;
  canRestoreAiSnapshot: boolean;
  description: string;
  descriptionError: string;
  detailsProviderMessage: string;
  detailsStatus: "idle" | "refining";
  focusSignal: number;
  onAdditionalDetailsRefine: (details: string) => Promise<"integrated" | "duplicate" | "error">;
  onAiApply: () => void;
  onAiAnalyze: () => void;
  onAiEditDescription: () => void;
  onAiGenerateAnother: () => void;
  onAiIgnore: () => void;
  onAiRestorePrevious: () => void;
  onBack: () => void;
  onContinue: () => void;
  onDescriptionChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  title: string;
};

const descriptionId = "service-request-description";
const descriptionErrorId = "service-request-description-error";
const additionalDetailsId = "service-request-additional-details";
const additionalDetailsErrorId = "service-request-additional-details-error";

function formatPriceRange(min: number, max: number, currency: string) {
  return `${min} ${currency} - ${max} ${currency}`;
}

const urgencyLabels = {
  LOW: "Baja",
  NORMAL: "Normal",
  HIGH: "Alta",
  EMERGENCY: "Emergencia"
} as const;

function getProviderLabel(aiAnalysis: ServiceRequestAiAnalysis) {
  if (aiAnalysis.provider === "groq" && !aiAnalysis.fallbackUsed) return "Análisis principal generado con Groq";
  return "Análisis principal generado con modo local de respaldo";
}

function replaceUrgencyCodes(value: string) {
  return value
    .replace(/\bEMERGENCY\b/g, urgencyLabels.EMERGENCY)
    .replace(/\bNORMAL\b/g, urgencyLabels.NORMAL)
    .replace(/\bHIGH\b/g, urgencyLabels.HIGH)
    .replace(/\bLOW\b/g, urgencyLabels.LOW);
}

function buildAdditionalDetailsPlaceholder(items: string[]) {
  const normalizedItems = items.map((item) => item.toLowerCase()).slice(0, 4);
  if (normalizedItems.length === 0) return "Escribe cualquier dato adicional que pueda ayudar al profesional.";

  const hasFurniture = normalizedItems.some((item) => item.includes("mueble") || item.includes("pared") || item.includes("herrajes"));
  if (hasFurniture) return "Ejemplo: indica la cantidad de muebles, si deben fijarse a la pared y si tienes herrajes.";

  const hasClog = normalizedItems.some((item) => item.includes("atasco") || item.includes("desatasc") || item.includes("inodoro"));
  if (hasClog) return "Ejemplo: indica la marca o modelo, cuándo comenzó el atasco y qué soluciones has intentado.";

  const ideas = normalizedItems
    .map((item) => {
      if (item.includes("marca") || item.includes("modelo")) return "la marca o modelo";
      if (item.includes("desde") || item.includes("cuándo") || item.includes("cuando")) return "cuándo comenzó el problema";
      if (item.includes("foto")) return "si tienes fotos";
      if (item.includes("medida")) return "las medidas aproximadas";
      if (item.includes("cambio")) return "si hubo cambios recientes";
      return item;
    })
    .filter((item, index, self) => self.indexOf(item) === index)
    .slice(0, 3);

  return ideas.length > 0 ? `Ejemplo: indica ${ideas.join(", ").replace(/, ([^,]*)$/, " y $1")}.` : "Escribe cualquier dato adicional que pueda ayudar al profesional.";
}

export function DescriptionStep({
  aiAnalysis,
  aiApplied,
  aiHighlightedFields,
  aiPanelMessage,
  aiStale,
  aiStatus,
  canRestoreAiSnapshot,
  description,
  descriptionError,
  detailsProviderMessage,
  detailsStatus,
  focusSignal,
  onAdditionalDetailsRefine,
  onAiApply,
  onAiAnalyze,
  onAiEditDescription,
  onAiGenerateAnother,
  onAiIgnore,
  onAiRestorePrevious,
  onBack,
  onContinue,
  onDescriptionChange,
  onTitleChange,
  title
}: DescriptionStepProps) {
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [additionalDetailsError, setAdditionalDetailsError] = useState("");
  const [additionalDetailsMessage, setAdditionalDetailsMessage] = useState("");
  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const visibleDescriptionError = descriptionError || (descriptionTouched ? getDescriptionError(description) : "");
  const titleFieldClassName = aiHighlightedFields.includes("title") ? "request-field ai-field-highlight" : "request-field";
  const descriptionFieldClassName = aiHighlightedFields.includes("description") ? "request-field request-field-wide ai-field-highlight" : "request-field request-field-wide";
  const additionalDetailsPlaceholder = aiAnalysis ? buildAdditionalDetailsPlaceholder(aiAnalysis.professionalInformationNeeded ?? []) : "";

  useEffect(() => {
    descriptionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    descriptionRef.current?.focus();
  }, [focusSignal]);

  useEffect(() => {
    if (visibleDescriptionError) {
      descriptionRef.current?.focus();
    }
  }, [visibleDescriptionError]);

  const updateDescription = (value: string) => {
    onDescriptionChange(value);
    if ((descriptionTouched || descriptionError) && !getDescriptionError(value)) {
      setDescriptionTouched(false);
    }
  };

  const analyzeWithAi = () => {
    setAdditionalDetailsError("");
    setAdditionalDetailsMessage("");
    onAiAnalyze();
  };

  const refineAdditionalDetails = async () => {
    const details = additionalDetails.replace(/\s+/g, " ").trim();

    if (details.length < 3) {
      setAdditionalDetailsMessage("");
      setAdditionalDetailsError("Escribe algún detalle antes de añadirlo.");
      return;
    }

    setAdditionalDetailsError("");
    setAdditionalDetailsMessage("");
    const result = await onAdditionalDetailsRefine(details);
    if (result === "duplicate") {
      setAdditionalDetailsMessage("");
      setAdditionalDetailsError("Estos detalles ya fueron revisados e integrados.");
      return;
    }
    if (result === "error") {
      setAdditionalDetailsMessage("");
      setAdditionalDetailsError("No fue posible mejorar los detalles. Inténtalo nuevamente.");
      return;
    }

    setAdditionalDetails("");
    setAdditionalDetailsError("");
    setAdditionalDetailsMessage("");
  };

  return (
    <div className="request-step-panel">
      <div className="request-step-heading">
        <h2>Descripción del trabajo</h2>
        <p>Cuéntanos qué ocurre. La descripción puede tener varias líneas y no activa todavía FixGo IA.</p>
      </div>

      <div className="request-form-grid">
        <label className={titleFieldClassName}>
          <span>Título del trabajo</span>
          <input
            maxLength={120}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Ej: Reparar fuga en la cocina"
            value={title}
          />
        </label>

        <label className={descriptionFieldClassName} htmlFor={descriptionId}>
          <span>Descripción</span>
          <textarea
            aria-describedby={visibleDescriptionError ? descriptionErrorId : undefined}
            aria-invalid={visibleDescriptionError ? "true" : "false"}
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
          {visibleDescriptionError ? (
            <strong id={descriptionErrorId} role="alert">{visibleDescriptionError}</strong>
          ) : null}
        </div>
      </div>

      <div className="ai-assistant-panel">
        <div>
          <strong>FixGo IA</strong>
          <span>Analiza la descripción y propone una estructura editable.</span>
        </div>
        <button
          className="request-secondary-action"
          disabled={aiStatus === "analyzing" || Boolean(getDescriptionError(description))}
          onClick={analyzeWithAi}
          type="button"
        >
          {aiStatus === "analyzing" ? "Analizando..." : "Analizar con IA"}
        </button>
      </div>

      {aiStatus === "error" ? <p className="ai-assistant-error">No se pudo analizar la solicitud. Inténtalo nuevamente.</p> : null}
      {aiStatus === "analyzing" && !aiAnalysis ? <p className="ai-assistant-progress" role="status">Generando otra propuesta...</p> : null}

      {aiAnalysis ? (
        <div className="ai-result-panel">
          <div className="sr-only" aria-live="polite">{aiPanelMessage || additionalDetailsMessage || additionalDetailsError}</div>
          <span className="ai-provider-badge">
            {getProviderLabel(aiAnalysis)}
          </span>
          {aiPanelMessage ? (
            <div className="ai-apply-confirmation" role="status">
              <strong>{aiPanelMessage}</strong>
              <p>Revisa los campos actualizados y pulsa Continuar cuando la información sea correcta.</p>
            </div>
          ) : null}
          {aiStale ? (
            <div className="ai-stale-warning" role="status">
              La solicitud cambió desde el último análisis. Vuelve a analizar para actualizar la categoría, urgencia y precio orientativo.
            </div>
          ) : null}
          {!aiStale ? <div className="ai-result-header">
            <div className={aiHighlightedFields.includes("category") || aiHighlightedFields.includes("service") ? "ai-field-highlight" : undefined}>
              <span>Trabajo detectado</span>
              <strong>{aiAnalysis.detectedWorkType}</strong>
            </div>
            <div className={aiHighlightedFields.includes("urgency") ? "ai-field-highlight" : undefined}>
              <span>Urgencia sugerida</span>
              <strong>{urgencyLabels[aiAnalysis.suggestedUrgency]}</strong>
            </div>
            <div className={aiHighlightedFields.includes("price") ? "ai-field-highlight" : undefined}>
              <span>Precio orientativo de FixGo IA</span>
              <strong>
                {formatPriceRange(aiAnalysis.suggestedBudgetRange.min, aiAnalysis.suggestedBudgetRange.max, aiAnalysis.suggestedBudgetRange.currency)}
              </strong>
            </div>
          </div> : null}
          <div className="ai-urgency-reason">
            <strong>Motivo</strong>
            <p>{replaceUrgencyCodes(aiAnalysis.urgencyReason)}</p>
          </div>
          <div className="ai-improved-description">
            <strong>Descripción mejorada</strong>
            <p>{replaceUrgencyCodes(aiAnalysis.improvedDescription)}</p>
          </div>
          {(
            <div className="ai-professional-information">
              <strong>Información útil para recibir un presupuesto más preciso</strong>
              {aiAnalysis.professionalInformationNeeded?.length ? (
                <ul>
                  {aiAnalysis.professionalInformationNeeded.slice(0, 4).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              <p>Puedes añadir estos datos a la descripción antes de continuar.</p>
              <label className="request-field ai-additional-details-field" htmlFor={additionalDetailsId}>
                <span>Añade los detalles que conozcas</span>
                <small>No es obligatorio responder todo. Escribe únicamente la información que conozcas.</small>
                <textarea
                  aria-describedby={additionalDetailsError ? additionalDetailsErrorId : undefined}
                  aria-invalid={additionalDetailsError ? "true" : "false"}
                  id={additionalDetailsId}
                  maxLength={800}
                  onChange={(event) => {
                    setAdditionalDetails(event.target.value);
                    if (additionalDetailsError) setAdditionalDetailsError("");
                  }}
                  placeholder={additionalDetailsPlaceholder}
                  rows={4}
                  value={additionalDetails}
                />
              </label>
              {additionalDetailsError ? <p className="field-error" id={additionalDetailsErrorId} role="alert">{additionalDetailsError}</p> : null}
              {additionalDetailsMessage ? <p className="ai-inline-success" role="status">{additionalDetailsMessage}</p> : null}
              {detailsProviderMessage ? <p className="ai-provider-detail">{detailsProviderMessage}</p> : null}
              <button className="request-secondary-action" disabled={detailsStatus === "refining"} onClick={refineAdditionalDetails} type="button">
                {detailsStatus === "refining" ? "Mejorando detalles..." : "Mejorar e integrar detalles con IA"}
              </button>
            </div>
          )}
          {aiAnalysis.safetyWarning ? (
            <div className="ai-safety-warning">
              <strong>Aviso de seguridad</strong>
              <p>{replaceUrgencyCodes(aiAnalysis.safetyWarning)}</p>
            </div>
          ) : null}
          <div className="ai-result-actions">
            {!aiApplied ? (
              <>
                <button className="request-secondary-action ai-action-primary" disabled={aiStale} onClick={onAiApply} type="button">
                  Usar recomendación de FixGo IA
                </button>
                <button className="request-secondary-action ai-action-secondary" onClick={onAiGenerateAnother} type="button">
                  Generar otra propuesta
                </button>
                <button className="request-secondary-action ai-action-tertiary" onClick={onAiEditDescription} type="button">
                  Editar mi descripción
                </button>
                <button className="request-secondary-action ai-action-dismiss" onClick={onAiIgnore} type="button">
                  Ignorar recomendación
                </button>
              </>
            ) : (
              <>
                <button className="request-secondary-action" disabled type="button">
                  ✓ Recomendación aplicada
                </button>
                <button className="request-secondary-action" onClick={onAiAnalyze} type="button">
                  Volver a analizar
                </button>
                <button className="request-secondary-action" disabled={!canRestoreAiSnapshot} onClick={onAiRestorePrevious} type="button">
                  Restaurar mis datos anteriores
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}

      <div className="request-step-actions">
        <button className="request-secondary-action" onClick={onBack} type="button">
          Atrás
        </button>
        <button className="primary-wide" onClick={onContinue} type="button">
          Continuar
        </button>
      </div>
    </div>
  );
}
