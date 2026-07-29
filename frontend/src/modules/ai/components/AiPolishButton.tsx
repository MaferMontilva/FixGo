import { Sparkles } from "lucide-react";
import { useState } from "react";
import type { ApiError } from "../../../shared/types/apiError";
import { polishTextWithAi, type PolishTextStyle } from "../services/aiTextApi";

type AiPolishButtonProps = {
  value: string;
  onResult: (text: string) => void;
  style?: PolishTextStyle;
  label?: string;
  minLength?: number;
};

// Botón "Corregir con IA": toma el texto actual, lo corrige/redacta y devuelve el resultado.
export function AiPolishButton({ value, onResult, style = "generic", label = "Corregir con IA", minLength = 2 }: AiPolishButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canRun = value.trim().length >= minLength && !loading;

  const handleClick = async () => {
    if (!canRun) return;
    setError("");
    try {
      setLoading(true);
      const result = await polishTextWithAi({ text: value.trim(), style });
      if (result.text) onResult(result.text);
    } catch (polishError) {
      setError((polishError as ApiError).message || "No pudimos corregir el texto. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-polish">
      <button type="button" className="ai-polish-btn" onClick={handleClick} disabled={!canRun}>
        <Sparkles size={15} /> {loading ? "Corrigiendo..." : label}
      </button>
      {error ? <span className="ai-polish-error">{error}</span> : null}
    </div>
  );
}
