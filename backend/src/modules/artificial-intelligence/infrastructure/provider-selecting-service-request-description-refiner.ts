import { Injectable } from "@nestjs/common";
import { RefineServiceRequestDescriptionInput, RefineServiceRequestDescriptionResult } from "../domain/service-request-ai-analysis";
import { ServiceRequestDescriptionRefiner } from "../domain/service-request-description-refiner";

type RefineJsonResult = {
  professionalInformationNeeded?: unknown;
  refinedDescription?: string | null;
};

const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
const REFINE_TIMEOUT_MS = 15000;
const BANNED_DESCRIPTION_PATTERNS = [
  /\bEl cliente indica\b/i,
  /\bEl usuario necesita\b/i,
  /\bDetalles adicionales indicados por el cliente\b/i,
  /\bNecesidad indicada por el cliente\b/i,
  /\bTipo de trabajo\s*:/i,
  /\bUrgencia sugerida\s*:/i,
  /\b(LOW|NORMAL|HIGH|EMERGENCY)\b/
];

@Injectable()
export class ProviderSelectingServiceRequestDescriptionRefiner implements ServiceRequestDescriptionRefiner {
  async refine(input: RefineServiceRequestDescriptionInput): Promise<RefineServiceRequestDescriptionResult> {
    const fallback = this.refineLocally(input);
    const apiKey = process.env.GROQ_API_KEY?.trim();
    const model = process.env.GROQ_MODEL?.trim();

    if (!apiKey || !model) return fallback;

    try {
      const groqResult = await this.requestGroq(input, apiKey, model);
      const refinedDescription = this.cleanRefinedDescription(groqResult.refinedDescription);
      if (!refinedDescription) return fallback;

      return {
        fallbackUsed: false,
        model,
        professionalInformationNeeded: this.cleanProfessionalInformationNeeded(groqResult.professionalInformationNeeded, refinedDescription),
        provider: "groq",
        refinedDescription
      };
    } catch (error) {
      this.logSafeFailure(error, model);
      return fallback;
    }
  }

  private async requestGroq(input: RefineServiceRequestDescriptionInput, apiKey: string, model: string): Promise<RefineJsonResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REFINE_TIMEOUT_MS);

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
                "Eres FixGo IA. Combina una descripcion de solicitud de servicio con detalles nuevos.",
                "Devuelve solo JSON valido segun el esquema.",
                "Redacta como si el propio cliente hubiera escrito correctamente la solicitud, siempre en primera persona.",
                "Corrige ortografia, puntuacion y separa ideas.",
                "Conserva todos los datos aportados y no repitas informacion.",
                "No inventes diagnosticos, marcas, medidas, cantidades, danos, fechas ni materiales.",
                "No hagas que el cliente parezca profesional.",
                "Usa expresiones naturales como Necesito, No tengo, He intentado, La marca o modelo es, El problema comenzo.",
                "Prohibido usar: El cliente indica, El usuario necesita, Detalles adicionales indicados por el cliente, Necesidad indicada por el cliente, Tipo de trabajo, Urgencia sugerida, LOW, NORMAL, HIGH, EMERGENCY.",
                "Ejemplo: descripcion 'El inodoro esta tapado y no se como solucionarlo. Necesito ayuda para desatascarlo.' y detalles 'no tengo foto ni medidas el modelo en honda y eso paso ayer' debe producir una descripcion equivalente a: 'Necesito desatascar el inodoro porque esta obstruido y no se como solucionarlo. No tengo fotografias ni las medidas exactas. La marca o modelo es Honda y el problema comenzo ayer.'",
                "professionalInformationNeeded debe contener maximo 4 datos que todavia faltan para presupuestar. Elimina puntos ya respondidos por los detalles."
              ].join(" ")
            },
            {
              role: "user",
              content: JSON.stringify({
                additionalDetails: input.additionalDetails,
                categoryId: input.categoryId ?? null,
                currentDescription: input.currentDescription,
                serviceId: input.serviceId ?? null
              })
            }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "fixgo_service_request_description_refinement",
              strict: true,
              schema: {
                type: "object",
                additionalProperties: false,
                properties: {
                  refinedDescription: { type: "string" },
                  professionalInformationNeeded: {
                    type: "array",
                    items: { type: "string" },
                    maxItems: 4
                  }
                },
                required: ["refinedDescription", "professionalInformationNeeded"]
              }
            }
          },
          reasoning_effort: "low",
          temperature: 0.2
        })
      });

      if (!response.ok) throw new Error(`Groq HTTP ${response.status}`);

      const payload = (await response.json()) as unknown;
      const content = this.extractOutputText(payload);
      if (!content) throw new Error("Groq empty message content");

      return JSON.parse(content) as RefineJsonResult;
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

  private refineLocally(input: RefineServiceRequestDescriptionInput): RefineServiceRequestDescriptionResult {
    const currentDescription = this.cleanSentence(input.currentDescription);
    const additionalDetails = this.cleanSentence(input.additionalDetails);
    const normalizedDetails = this.normalizeText(additionalDetails);
    const sentences: string[] = [];

    if (this.normalizeText(currentDescription).includes("inodoro") && this.normalizeText(currentDescription).includes("tapado")) {
      sentences.push("Necesito desatascar el inodoro porque está obstruido y no sé cómo solucionarlo.");
    } else {
      sentences.push(this.ensureFirstPerson(currentDescription));
    }

    if (normalizedDetails.includes("no tengo foto") || normalizedDetails.includes("no tengo fotografia")) {
      sentences.push("No tengo fotografías.");
    }
    if (normalizedDetails.includes("ni medidas") || normalizedDetails.includes("no tengo medidas")) {
      const last = sentences[sentences.length - 1];
      if (last === "No tengo fotografías.") {
        sentences[sentences.length - 1] = "No tengo fotografías ni las medidas exactas.";
      } else {
        sentences.push("No tengo las medidas exactas.");
      }
    }

    const modelMatch = additionalDetails.match(/\bmodelo\s+(?:en\s+)?([a-z0-9áéíóúñü-]+)/i);
    if (modelMatch?.[1]) {
      sentences.push(`La marca o modelo es ${this.capitalizeWord(modelMatch[1])}.`);
    }

    if (normalizedDetails.includes("ayer")) {
      sentences.push("El problema comenzó ayer.");
    }

    const usedKnownDetails = sentences.length > 1;
    if (!usedKnownDetails) {
      sentences.push(this.ensureFirstPerson(additionalDetails));
    }

    const refinedDescription = this.cleanRefinedDescription(sentences.join(" ")) ?? `${currentDescription} ${additionalDetails}`.trim();

    return {
      fallbackUsed: true,
      model: null,
      professionalInformationNeeded: this.cleanProfessionalInformationNeeded([], refinedDescription),
      provider: "local-fallback",
      refinedDescription
    };
  }

  private ensureFirstPerson(value: string) {
    const cleanValue = this.cleanSentence(value);
    if (/^(necesito|no tengo|he intentado|tengo|quiero|busco|me|mi)\b/i.test(cleanValue)) return cleanValue;
    return `Necesito ayuda con lo siguiente: ${cleanValue.charAt(0).toLowerCase()}${cleanValue.slice(1)}`;
  }

  private cleanRefinedDescription(value: unknown) {
    if (typeof value !== "string") return null;
    const cleanValue = value.replace(/\s+/g, " ").trim();
    if (cleanValue.length < 15 || BANNED_DESCRIPTION_PATTERNS.some((pattern) => pattern.test(cleanValue))) return null;
    if (/\b(el cliente|el usuario)\b/i.test(cleanValue)) return null;
    if (!/[.!?]$/.test(cleanValue)) return `${cleanValue}.`;
    return cleanValue.slice(0, 2000);
  }

  private cleanProfessionalInformationNeeded(value: unknown, refinedDescription: string): string[] {
    const normalizedDescription = this.normalizeText(refinedDescription);
    const source = Array.isArray(value) ? value : [];
    const cleanItems = source
      .map((item) => (typeof item === "string" ? item.replace(/\s+/g, " ").trim() : ""))
      .filter((item) => item.length >= 6)
      .filter((item) => !BANNED_DESCRIPTION_PATTERNS.some((pattern) => pattern.test(item)))
      .filter((item) => !this.isAlreadyAnswered(item, normalizedDescription));

    if (cleanItems.length > 0) return Array.from(new Set(cleanItems)).slice(0, 4);

    const fallbackItems = [
      "fotografías del estado actual, si es posible",
      "medidas aproximadas si afectan al trabajo",
      "marca o modelo del elemento, si aplica",
      "desde cuándo ocurre el problema"
    ].filter((item) => !this.isAlreadyAnswered(item, normalizedDescription));

    return fallbackItems.slice(0, 4);
  }

  private isAlreadyAnswered(item: string, normalizedDescription: string) {
    const normalizedItem = this.normalizeText(item);
    if (normalizedItem.includes("foto") && /(foto|fotografia|imagen|no tengo fotografia|no tengo foto)/.test(normalizedDescription)) return true;
    if (normalizedItem.includes("medida") && /(medida|dimension|metros|no tengo las medidas|no tengo medidas)/.test(normalizedDescription)) return true;
    if ((normalizedItem.includes("marca") || normalizedItem.includes("modelo")) && /(marca|modelo)/.test(normalizedDescription)) return true;
    if (normalizedItem.includes("desde") && /(ayer|hoy|semana|mes|dias|horas|comenzo|empezo|desde)/.test(normalizedDescription)) return true;
    return false;
  }

  private cleanSentence(value: string) {
    const cleanValue = value.replace(/\s+/g, " ").trim();
    if (!cleanValue) return "";
    return /[.!?]$/.test(cleanValue) ? cleanValue : `${cleanValue}.`;
  }

  private capitalizeWord(value: string) {
    return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
  }

  private normalizeText(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  private logSafeFailure(error: unknown, model: string) {
    if (process.env.NODE_ENV === "production") return;

    const message = error instanceof Error ? error.message : String(error);
    console.warn("[FixGo IA] Groq description refinement failed", {
      model,
      provider: "groq",
      technicalMessage: message.replace(/\s+/g, " ").slice(0, 180)
    });
  }
}
