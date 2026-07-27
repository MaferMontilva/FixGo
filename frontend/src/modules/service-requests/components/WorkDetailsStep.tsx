import { useEffect, useRef, useState } from "react";
import type { RequestUrgency } from "../types/serviceRequest";
import { getWorkDetailsErrors } from "../validation/serviceRequestValidation";
import type { WorkDetailsValidationErrors } from "../validation/serviceRequestValidation";

type WorkDetailsStepProps = {
  errors: WorkDetailsValidationErrors;
  flexibleSchedule: boolean;
  focusSignal: number;
  locationDescription: string;
  onFlexibleScheduleChange: (value: boolean) => void;
  onLocationDescriptionChange: (value: string) => void;
  onPostalCodeChange: (value: string) => void;
  onPreferredDateFromChange: (value: string) => void;
  onPreferredDateToChange: (value: string) => void;
  onUrgencyChange: (value: RequestUrgency) => void;
  preferredDateFrom: string;
  preferredDateTo: string;
  postalCode: string;
  urgency: RequestUrgency;
};

const locationId = "service-request-location";
const locationHelpId = "service-request-location-help";
const locationErrorId = "service-request-location-error";
const postalCodeId = "service-request-postal-code";
const postalCodeErrorId = "service-request-postal-code-error";
const urgencyErrorId = "service-request-urgency-error";
const dateFromId = "service-request-date-from";
const dateFromErrorId = "service-request-date-from-error";
const dateToId = "service-request-date-to";
const dateToErrorId = "service-request-date-to-error";

const urgencyOptions: Array<{ label: string; value: RequestUrgency; helper: string }> = [
  { label: "Baja", value: "LOW", helper: "Puede realizarse sin prisa." },
  { label: "Normal", value: "NORMAL", helper: "Necesito resolverlo pr\u00f3ximamente." },
  { label: "Alta", value: "HIGH", helper: "Necesito atenci\u00f3n lo antes posible." },
  { label: "Emergencia", value: "EMERGENCY", helper: "Existe un problema urgente que requiere atenci\u00f3n inmediata." }
];

function getTodayValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function WorkDetailsStep({
  errors,
  flexibleSchedule,
  focusSignal,
  locationDescription,
  onFlexibleScheduleChange,
  onLocationDescriptionChange,
  onPostalCodeChange,
  onPreferredDateFromChange,
  onPreferredDateToChange,
  onUrgencyChange,
  preferredDateFrom,
  preferredDateTo,
  postalCode,
  urgency
}: WorkDetailsStepProps) {
  const [touchedFields, setTouchedFields] = useState({
    locationDescription: false,
    postalCode: false,
    preferredDateFrom: false,
    preferredDateTo: false
  });
  const locationRef = useRef<HTMLInputElement | null>(null);
  const postalCodeRef = useRef<HTMLInputElement | null>(null);
  const dateFromRef = useRef<HTMLInputElement | null>(null);
  const dateToRef = useRef<HTMLInputElement | null>(null);
  const localErrors = getWorkDetailsErrors({
    flexibleSchedule,
    locationDescription,
    postalCode,
    preferredDateFrom,
    preferredDateTo,
    urgency
  });
  const visibleErrors: WorkDetailsValidationErrors = {
    locationDescription: errors.locationDescription || (touchedFields.locationDescription ? localErrors.locationDescription : undefined),
    postalCode: errors.postalCode || (touchedFields.postalCode ? localErrors.postalCode : undefined),
    preferredDateFrom: errors.preferredDateFrom || (!flexibleSchedule && touchedFields.preferredDateFrom ? localErrors.preferredDateFrom : undefined),
    preferredDateTo: errors.preferredDateTo || (touchedFields.preferredDateTo ? localErrors.preferredDateTo : undefined),
    urgency: errors.urgency
  };
  const today = getTodayValue();

  useEffect(() => {
    locationRef.current?.focus();
  }, [focusSignal]);

  useEffect(() => {
    if (errors.locationDescription) {
      locationRef.current?.focus();
      return;
    }
    if (errors.postalCode) {
      postalCodeRef.current?.focus();
      return;
    }
    if (errors.preferredDateFrom) {
      dateFromRef.current?.focus();
      return;
    }
    if (errors.preferredDateTo) {
      dateToRef.current?.focus();
    }
  }, [errors]);

  return (
    <div className="request-step-panel">
      <div className="request-step-heading">
        <h2>Datos del trabajo</h2>
        <p>Indica una zona general, la urgencia y tu disponibilidad aproximada.</p>
      </div>

      <div className="request-form-grid">
        <label className="request-field request-field-wide" htmlFor={locationId}>
          <span>Ubicaci&oacute;n general</span>
          <input
            aria-describedby={`${locationHelpId}${visibleErrors.locationDescription ? ` ${locationErrorId}` : ""}`}
            aria-invalid={visibleErrors.locationDescription ? "true" : "false"}
            id={locationId}
            maxLength={240}
            onBlur={() => setTouchedFields((current) => ({ ...current, locationDescription: true }))}
            onChange={(event) => onLocationDescriptionChange(event.target.value)}
            placeholder="Ej: Madrid, Tetuan; Valencia, Benimaclet"
            ref={locationRef}
            value={locationDescription}
          />
        </label>
        <div className="request-field-help request-field-wide">
          <span id={locationHelpId}>Indica ciudad, distrito o barrio. No escribas todav&iacute;a tu direcci&oacute;n exacta.</span>
          {visibleErrors.locationDescription ? (
            <strong id={locationErrorId} role="alert">{visibleErrors.locationDescription}</strong>
          ) : null}
        </div>
        <label className="request-field" htmlFor={postalCodeId}>
          <span>C&oacute;digo postal</span>
          <input
            aria-describedby={visibleErrors.postalCode ? postalCodeErrorId : undefined}
            aria-invalid={visibleErrors.postalCode ? "true" : "false"}
            id={postalCodeId}
            inputMode="numeric"
            maxLength={5}
            onBlur={() => setTouchedFields((current) => ({ ...current, postalCode: true }))}
            onChange={(event) => onPostalCodeChange(event.target.value.replace(/\D/g, "").slice(0, 5))}
            placeholder="Ej: 28020"
            ref={postalCodeRef}
            value={postalCode}
          />
          {visibleErrors.postalCode ? (
            <strong className="field-error" id={postalCodeErrorId} role="alert">{visibleErrors.postalCode}</strong>
          ) : null}
        </label>
      </div>

      <fieldset aria-describedby={visibleErrors.urgency ? urgencyErrorId : undefined} className="urgency-options">
        <legend>Urgencia</legend>
        {urgencyOptions.map((option) => (
          <label className={urgency === option.value ? "urgency-card is-selected" : "urgency-card"} key={option.value}>
            <input
              checked={urgency === option.value}
              name="service-request-urgency"
              onChange={() => onUrgencyChange(option.value)}
              type="radio"
              value={option.value}
            />
            <strong>{option.label}</strong>
            <span>{option.helper}</span>
          </label>
        ))}
      </fieldset>
      {visibleErrors.urgency ? <p className="form-error" id={urgencyErrorId} role="alert">{visibleErrors.urgency}</p> : null}

      <div className="availability-panel">
        <label className="request-checkbox">
          <input
            checked={flexibleSchedule}
            onChange={(event) => onFlexibleScheduleChange(event.target.checked)}
            type="checkbox"
          />
          <span>
            <strong>Mi horario es flexible</strong>
            <small>Podr&aacute;s coordinar las fechas exactas m&aacute;s adelante con el profesional.</small>
          </span>
        </label>

        <div className="request-form-grid two-columns">
          <label className="request-field" htmlFor={dateFromId}>
            <span>Fecha inicial preferida</span>
            <input
              aria-describedby={visibleErrors.preferredDateFrom ? dateFromErrorId : undefined}
              aria-invalid={visibleErrors.preferredDateFrom ? "true" : "false"}
              id={dateFromId}
              min={today}
              onBlur={() => setTouchedFields((current) => ({ ...current, preferredDateFrom: true }))}
              onChange={(event) => onPreferredDateFromChange(event.target.value)}
              ref={dateFromRef}
              type="date"
              value={preferredDateFrom}
            />
            {visibleErrors.preferredDateFrom ? (
              <strong className="field-error" id={dateFromErrorId} role="alert">{visibleErrors.preferredDateFrom}</strong>
            ) : null}
          </label>

          <label className="request-field" htmlFor={dateToId}>
            <span>Fecha final preferida</span>
            <input
              aria-describedby={visibleErrors.preferredDateTo ? dateToErrorId : undefined}
              aria-invalid={visibleErrors.preferredDateTo ? "true" : "false"}
              id={dateToId}
              min={preferredDateFrom || today}
              onBlur={() => setTouchedFields((current) => ({ ...current, preferredDateTo: true }))}
              onChange={(event) => onPreferredDateToChange(event.target.value)}
              ref={dateToRef}
              type="date"
              value={preferredDateTo}
            />
            {visibleErrors.preferredDateTo ? (
              <strong className="field-error" id={dateToErrorId} role="alert">{visibleErrors.preferredDateTo}</strong>
            ) : null}
          </label>
        </div>
      </div>
    </div>
  );
}
