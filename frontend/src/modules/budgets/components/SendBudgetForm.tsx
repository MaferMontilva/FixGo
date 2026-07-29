import { PlusCircle, Send, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { AiPolishButton } from "../../ai";
import type { ApiError } from "../../../shared/types/apiError";
import { createBudget } from "../services/budgetsApi";

type ItemRow = { description: string; quantity: string; unitPrice: string };

type SendBudgetFormProps = {
  serviceRequestId: number;
  onSent?: () => void;
};

const emptyRow = (): ItemRow => ({ description: "", quantity: "1", unitPrice: "" });

export function SendBudgetForm({ serviceRequestId, onSent }: SendBudgetFormProps) {
  const [items, setItems] = useState<ItemRow[]>([emptyRow()]);
  const [observations, setObservations] = useState("");
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState("HOURS");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);
        if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) return sum;
        return sum + quantity * unitPrice;
      }, 0),
    [items]
  );

  const updateItem = (index: number, field: keyof ItemRow, value: string) => {
    setItems((current) => current.map((item, position) => (position === index ? { ...item, [field]: value } : item)));
  };

  const addRow = () => setItems((current) => [...current, emptyRow()]);
  const removeRow = (index: number) =>
    setItems((current) => (current.length > 1 ? current.filter((_, position) => position !== index) : current));

  const validate = () => {
    for (const item of items) {
      const description = item.description.trim();
      if (description.length < 2) return "Cada concepto necesita una descripcion de al menos 2 caracteres.";
      if (description.length > 200) return "La descripcion de un concepto no puede superar los 200 caracteres.";

      const quantity = Number(item.quantity);
      if (!Number.isFinite(quantity) || quantity <= 0) return "La cantidad debe ser mayor que cero.";
      if (quantity > 100000) return "La cantidad no puede superar 100000.";

      const unitPrice = Number(item.unitPrice);
      if (!Number.isFinite(unitPrice) || unitPrice <= 0) return "El precio debe ser mayor que cero.";
      if (unitPrice > 1000000) return "El precio no puede superar 1000000.";
    }

    if (observations.trim().length > 1000) return "Las observaciones no pueden superar los 1000 caracteres.";

    if (durationValue) {
      const duration = Number(durationValue);
      if (!Number.isFinite(duration) || duration <= 0) return "La duracion estimada debe ser mayor que cero.";
      if (duration > 3650) return "La duracion estimada no es valida.";
    }

    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");

    try {
      setSubmitting(true);
      await createBudget({
        serviceRequestId,
        items: items.map((item) => ({
          description: item.description.trim(),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        })),
        observations: observations.trim() || undefined,
        estimatedDurationValue: durationValue ? Number(durationValue) : undefined,
        estimatedDurationUnit: durationValue ? durationUnit : undefined
      });
      setSent(true);
      onSent?.();
    } catch (submitError) {
      const apiError = submitError as ApiError;
      setError(apiError.message || "No pudimos enviar el presupuesto. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="budget-sent-box">
        <p>
          <strong>Presupuesto enviado.</strong> El cliente podra verlo y compararlo con los demas.
        </p>
      </div>
    );
  }

  return (
    <form className="budget-form" onSubmit={handleSubmit} noValidate>
      <h2 className="budget-form-title">Enviar presupuesto</h2>
      <div className="budget-items-head">
        <span>Concepto</span>
        <span>Cant.</span>
        <span>Precio/u.</span>
        <span />
      </div>
      {items.map((item, index) => (
        <div className="budget-item-row" key={index}>
          <input
            className="budget-input"
            lang="es"
            spellCheck
            placeholder="Ej. Mano de obra"
            value={item.description}
            onChange={(event) => updateItem(index, "description", event.target.value)}
          />
          <input
            className="budget-input"
            type="number"
            min="1"
            step="1"
            value={item.quantity}
            onChange={(event) => updateItem(index, "quantity", event.target.value)}
          />
          <input
            className="budget-input"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={item.unitPrice}
            onChange={(event) => updateItem(index, "unitPrice", event.target.value)}
          />
          <button type="button" className="budget-row-remove" onClick={() => removeRow(index)} aria-label="Quitar concepto">
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      <button type="button" className="budget-add-row" onClick={addRow}>
        <PlusCircle size={18} /> Anadir concepto
      </button>
      <label className="budget-field">
        <span>Observaciones (opcional)</span>
        <textarea
          value={observations}
          rows={3}
          maxLength={1000}
          lang="es"
          spellCheck
          placeholder="Detalles, materiales incluidos, garantia..."
          onChange={(event) => setObservations(event.target.value)}
        />
        <AiPolishButton value={observations} onResult={setObservations} style="budget-observations" />
      </label>
      <div className="budget-duration">
        <label className="budget-field">
          <span>Duracion estimada (opcional)</span>
          <input
            type="number"
            min="1"
            value={durationValue}
            placeholder="Ej. 3"
            onChange={(event) => setDurationValue(event.target.value)}
          />
        </label>
        <label className="budget-field">
          <span>Unidad</span>
          <select value={durationUnit} onChange={(event) => setDurationUnit(event.target.value)}>
            <option value="HOURS">Horas</option>
            <option value="DAYS">Dias</option>
            <option value="WEEKS">Semanas</option>
          </select>
        </label>
      </div>
      <p className="budget-total">
        Total: <strong>{total.toFixed(2)} EUR</strong>
      </p>
      {error ? <p className="pro-form-error" role="alert">{error}</p> : null}
      <button className="pro-primary-button" type="submit" disabled={submitting}>
        <Send size={18} /> {submitting ? "Enviando..." : "Enviar presupuesto"}
      </button>
    </form>
  );
}
