import { httpPost } from "../../../shared/http/httpClient";

export type PolishTextStyle = "professional-reply" | "budget-observations" | "client-review" | "generic";

export type PolishTextRequest = {
  text: string;
  style?: PolishTextStyle;
};

export type PolishTextResponse = {
  fallbackUsed: boolean;
  model: string | null;
  provider: "groq" | "local-fallback";
  text: string;
};

// Corrige ortografía/redacción de un texto usando la IA de FixGo (con respaldo local).
export function polishTextWithAi(payload: PolishTextRequest) {
  return httpPost<PolishTextResponse, PolishTextRequest>("/ai/polish-text", payload);
}
