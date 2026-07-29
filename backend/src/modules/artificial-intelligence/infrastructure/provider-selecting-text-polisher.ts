import { Injectable } from "@nestjs/common";
import { PolishTextInput, PolishTextResult, PolishTextStyle, TextPolisher } from "../domain/text-polisher";

const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
const POLISH_TIMEOUT_MS = 15000;
const MAX_INPUT_LENGTH = 1000;

// Instrucciones de tono segun el campo desde donde se pide la correccion.
const STYLE_INSTRUCTIONS: Record<PolishTextStyle, string> = {
  "professional-reply":
    "El texto es la respuesta de un profesional de oficios a la valoracion de un cliente. Usa un tono cordial, agradecido y profesional, en primera persona.",
  "budget-observations":
    "El texto son las observaciones de un presupuesto que un profesional envia a un cliente. Usa un tono claro y profesional, en primera persona.",
  "client-review":
    "El texto es la reseña de un cliente sobre un trabajo recibido. Manten un tono natural y honesto, en primera persona.",
  generic: "Corrige el texto manteniendo su tono original."
};

@Injectable()
export class ProviderSelectingTextPolisher implements TextPolisher {
  async polish(input: PolishTextInput): Promise<PolishTextResult> {
    const original = (input.text ?? "").slice(0, MAX_INPUT_LENGTH);
    const style: PolishTextStyle = input.style ?? "generic";
    const fallback = this.polishLocally(original);

    const apiKey = process.env.GROQ_API_KEY?.trim();
    const model = process.env.GROQ_MODEL?.trim();
    if (!apiKey || !model || original.trim().length < 2) return fallback;

    try {
      const polished = await this.requestGroq(original, style, apiKey, model);
      const clean = this.cleanOutput(polished);
      if (!clean) return fallback;
      return { fallbackUsed: false, model, provider: "groq", text: clean };
    } catch (error) {
      this.logSafeFailure(error, model);
      return fallback;
    }
  }

  private async requestGroq(text: string, style: PolishTextStyle, apiKey: string, model: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), POLISH_TIMEOUT_MS);

    try {
      const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: [
                "Eres FixGo IA, un asistente de redaccion en español.",
                "Tu tarea es corregir y mejorar la redaccion del texto del usuario.",
                "Corrige ortografia, tildes, gramatica y puntuacion.",
                "Conserva el idioma español y el significado original; no inventes datos, hechos ni cifras nuevas.",
                "Manten una longitud similar a la original y no agregues despedidas ni firmas.",
                STYLE_INSTRUCTIONS[style],
                "Devuelve UNICAMENTE el texto corregido, sin comillas, sin prefijos ni explicaciones."
              ].join(" ")
            },
            { role: "user", content: text }
          ],
          reasoning_effort: "low",
          temperature: 0.2
        })
      });

      if (!response.ok) throw new Error(`Groq HTTP ${response.status}`);

      const payload = (await response.json()) as unknown;
      const content = this.extractOutputText(payload);
      if (!content) throw new Error("Groq empty message content");
      return content;
    } finally {
      clearTimeout(timeout);
    }
  }

  private extractOutputText(payload: unknown) {
    if (!payload || typeof payload !== "object") return "";
    const choices = (payload as { choices?: unknown }).choices;
    if (!Array.isArray(choices) || choices.length === 0) return "";
    const firstChoice = choices[0];
    if (!firstChoice || typeof firstChoice !== "object") return "";
    const message = (firstChoice as { message?: unknown }).message;
    if (!message || typeof message !== "object") return "";
    const content = (message as { content?: unknown }).content;
    return typeof content === "string" ? content : "";
  }

  private cleanOutput(value: string): string | null {
    let clean = value.replace(/\s+/g, " ").trim();
    // Quitamos comillas envolventes que a veces añade el modelo.
    if ((clean.startsWith("\"") && clean.endsWith("\"")) || (clean.startsWith("“") && clean.endsWith("”"))) {
      clean = clean.slice(1, -1).trim();
    }
    if (clean.length < 2) return null;
    return clean.slice(0, MAX_INPUT_LENGTH);
  }

  // Fallback sin IA: limpieza segura de espacios, mayusculas y puntuacion.
  private polishLocally(text: string): PolishTextResult {
    const collapsed = text.replace(/\s+/g, " ").trim();
    if (!collapsed) {
      return { fallbackUsed: true, model: null, provider: "local-fallback", text: collapsed };
    }

    // Capitaliza la primera letra de cada oracion (tras . ! ? o al inicio).
    const capitalized = collapsed.replace(/(^\s*|[.!?¡¿]\s+)([a-záéíóúñü])/g, (_match, prefix, letter) => `${prefix}${letter.toUpperCase()}`);
    const withEnding = /[.!?…]$/.test(capitalized) ? capitalized : `${capitalized}.`;

    return { fallbackUsed: true, model: null, provider: "local-fallback", text: withEnding };
  }

  private logSafeFailure(error: unknown, model: string) {
    if (process.env.NODE_ENV === "production") return;
    const message = error instanceof Error ? error.message : String(error);
    console.warn("[FixGo IA] Groq text polish failed", {
      model,
      provider: "groq",
      technicalMessage: message.replace(/\s+/g, " ").slice(0, 180)
    });
  }
}
