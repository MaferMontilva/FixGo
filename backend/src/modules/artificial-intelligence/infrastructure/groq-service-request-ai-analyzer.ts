import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../shared/prisma.service";
import {
  AnalyzeServiceRequestInput,
  BudgetRangeSuggestion,
  ServiceRequestAiAnalysis,
  ServiceRequestAiUrgency
} from "../domain/service-request-ai-analysis";
import { ServiceRequestAiAnalyzer } from "../domain/service-request-ai-analyzer";
import { RuleBasedServiceRequestAiAnalyzer } from "./rule-based-service-request-ai-analyzer";

type ActiveCategory = {
  id: number;
  code: string;
  name: string;
  slug: string;
};

type ActiveService = {
  id: number;
  categoryId: number;
  code: string;
  name: string;
  slug: string;
};

type GroqJsonResult = {
  estimatedPriceMax?: number | null;
  estimatedPriceMin?: number | null;
  improvedDescription?: string | null;
  professionalInformationNeeded?: unknown;
  safetyWarning?: string | null;
  suggestedCategoryId?: number | string | null;
  suggestedServiceId?: number | string | null;
  suggestedTitle?: string | null;
  suggestedUrgency?: string | null;
  urgencyReason?: string | null;
};

type GroqFailureStage = "request" | "extraction" | "JSON parse" | "business validation";

class GroqAnalyzerError extends Error {
  constructor(
    readonly stage: GroqFailureStage,
    message: string,
    readonly httpStatus?: number
  ) {
    super(message);
  }
}

const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_TIMEOUT_MS = 15000;
const URGENCIES: ServiceRequestAiUrgency[] = ["LOW", "NORMAL", "HIGH", "EMERGENCY"];
const URGENCY_LABELS: Record<ServiceRequestAiUrgency, string> = {
  EMERGENCY: "Emergencia",
  HIGH: "Alta",
  LOW: "Baja",
  NORMAL: "Normal"
};

@Injectable()
export class GroqServiceRequestAiAnalyzer implements ServiceRequestAiAnalyzer {
  private readonly fallbackAnalyzer = new RuleBasedServiceRequestAiAnalyzer();

  constructor(private readonly prisma: PrismaService) {}

  async analyze(input: AnalyzeServiceRequestInput): Promise<ServiceRequestAiAnalysis> {
    const apiKey = process.env.GROQ_API_KEY?.trim();
    const model = process.env.GROQ_MODEL?.trim();
    const catalog = await this.loadCatalog();
    const fallback = await this.buildFallback(input, catalog.categories, catalog.services);

    if (!apiKey || !model) {
      return fallback;
    }

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const groqResult = await this.requestGroq(input, catalog.categories, catalog.services, apiKey, model, attempt === 2);
        return this.toValidatedAnalysis(groqResult, input, fallback, catalog.categories, catalog.services, model);
      } catch (error) {
        this.logSafeFailure(error, model, attempt);
        if (attempt === 2) return fallback;
      }
    }

    return fallback;
  }

  private async loadCatalog() {
    try {
      const [categories, services] = await Promise.all([this.findActiveCategories(), this.findActiveServices()]);
      return { categories, services };
    } catch {
      return { categories: [], services: [] };
    }
  }

  private async findActiveCategories(): Promise<ActiveCategory[]> {
    return this.prisma.categories.findMany({
      where: { isActive: 1 },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
        slug: true
      }
    });
  }

  private async findActiveServices(): Promise<ActiveService[]> {
    const activeCategories = await this.prisma.categories.findMany({
      where: { isActive: 1 },
      select: { id: true }
    });
    const activeCategoryIds = activeCategories.map((category) => category.id);

    if (activeCategoryIds.length === 0) return [];

    return this.prisma.services.findMany({
      where: {
        isActive: 1,
        categoryId: { in: activeCategoryIds }
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        categoryId: true,
        code: true,
        name: true,
        slug: true
      }
    });
  }

  private async requestGroq(
    input: AnalyzeServiceRequestInput,
    categories: ActiveCategory[],
    services: ActiveService[],
    apiKey: string,
    model: string,
    correctionAttempt: boolean
  ): Promise<GroqJsonResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

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
                "Eres FixGo IA. Analiza solicitudes de servicios del hogar en Espana.",
                "Devuelve exclusivamente un JSON que cumpla el esquema. No incluyas razonamiento, tool calls, markdown ni texto fuera del JSON.",
                "No publiques, no guardes, no selecciones profesionales, no aceptes presupuestos y no garantices precios.",
                "Usa exclusivamente las urgencias LOW, NORMAL, HIGH, EMERGENCY.",
                "La improvedDescription debe corregir ortografia y puntuacion, redactar en espanol natural y expresar claramente el trabajo solicitado.",
                "Usa solamente los datos aportados por el cliente. No inventes medidas, marcas, materiales, cantidades, danos, fechas ni ubicaciones no indicadas.",
                "Puedes anadir contexto tecnico general solo si es consecuencia segura del servicio.",
                "No incluyas codigos internos, 'Tipo de trabajo:' ni 'Urgencia sugerida:'.",
                "Caso obligatorio: entrada 'montar muebles cocina'; improvedDescription equivalente a 'Necesito realizar el montaje de los muebles de la cocina, que actualmente se encuentran desmontados.'.",
                "professionalInformationNeeded debe listar datos utiles para preparar presupuesto que el cliente no proporciono, maximo 4 elementos, sin inventar respuestas.",
                "Si hay riesgo inmediato para personas o vivienda, clasifica EMERGENCY y devuelve safetyWarning no nulo recomendando contactar con el 112 cuando exista riesgo inmediato para una persona.",
                correctionAttempt
                  ? "Segundo intento: corrige cualquier frase rota, palabra pegada, etiqueta interna, repeticion literal de una entrada breve o informacion inventada."
                  : ""
              ].filter(Boolean).join(" ")
            },
            {
              role: "user",
              content: JSON.stringify({
                currentRequest: {
                  title: input.title ?? null,
                  description: input.description,
                  categoryId: input.categoryId ?? null,
                  categoryName: input.categoryName ?? null,
                  serviceId: input.serviceId ?? null,
                  serviceName: input.serviceName ?? null,
                  urgency: input.urgency ?? null
                },
                activeCategories: categories.map(({ id, code, name, slug }) => ({ id, code, name, slug })),
                activeServices: services.map(({ id, categoryId, code, name, slug }) => ({ id, categoryId, code, name, slug })),
                businessRules: [
                  "Bebe, nino, menor, adulto mayor o persona vulnerable encerrada: EMERGENCY.",
                  "Persona atrapada o aplastada: EMERGENCY.",
                  "Objeto pesado encima de una persona: EMERGENCY.",
                  "Inundacion entrando en la vivienda: EMERGENCY.",
                  "Muebles flotando por agua: EMERGENCY.",
                  "Olor a gas, humo, fuego o chispas: EMERGENCY.",
                  "Riesgo inmediato para personas o vivienda: EMERGENCY.",
                  "Fuga activa sin riesgo inmediato confirmado: HIGH.",
                  "Cliente fuera de casa, pero todos estan seguros: HIGH o NORMAL segun contexto.",
                  "Cambio preventivo o mantenimiento: NORMAL o LOW.",
                  "El precio es orientativo de FixGo IA, no presupuesto profesional ni garantia."
                ]
              })
            }
          ],
          response_format: this.buildResponseFormat(),
          reasoning_effort: "low",
          temperature: 0.2
        })
      });

      if (!response.ok) throw new GroqAnalyzerError("request", "Groq HTTP error", response.status);

      const payload = (await response.json()) as unknown;
      const text = this.extractOutputText(payload);
      if (!text) throw new GroqAnalyzerError("extraction", "Groq empty message content", response.status);

      try {
        return JSON.parse(text) as GroqJsonResult;
      } catch {
        throw new GroqAnalyzerError("JSON parse", "Groq message content is not valid JSON", response.status);
      }
    } catch (error) {
      if (error instanceof GroqAnalyzerError) throw error;
      throw new GroqAnalyzerError("request", this.sanitizeTechnicalMessage(error));
    } finally {
      clearTimeout(timeout);
    }
  }

  private extractOutputText(payload: unknown): string {
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

  private buildResponseFormat() {
    return {
      type: "json_schema",
      json_schema: {
        name: "fixgo_service_request_analysis",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            suggestedTitle: { type: "string" },
            improvedDescription: { type: "string" },
            suggestedCategoryId: { anyOf: [{ type: "string" }, { type: "null" }] },
            suggestedServiceId: { anyOf: [{ type: "string" }, { type: "null" }] },
            suggestedUrgency: { type: "string", enum: URGENCIES },
            urgencyReason: { type: "string" },
            estimatedPriceMin: { anyOf: [{ type: "number" }, { type: "null" }] },
            estimatedPriceMax: { anyOf: [{ type: "number" }, { type: "null" }] },
            professionalInformationNeeded: {
              type: "array",
              items: { type: "string" },
              maxItems: 4
            },
            safetyWarning: { anyOf: [{ type: "string" }, { type: "null" }] }
          },
          required: [
            "suggestedTitle",
            "improvedDescription",
            "suggestedCategoryId",
            "suggestedServiceId",
            "suggestedUrgency",
            "urgencyReason",
            "estimatedPriceMin",
            "estimatedPriceMax",
            "professionalInformationNeeded",
            "safetyWarning"
          ]
        }
      }
    };
  }

  private toValidatedAnalysis(
    result: GroqJsonResult,
    input: AnalyzeServiceRequestInput,
    fallback: ServiceRequestAiAnalysis,
    categories: ActiveCategory[],
    services: ActiveService[],
    model: string
  ): ServiceRequestAiAnalysis {
    const emergency = this.detectEmergencyOverride(input.description);
    const currentCategory = this.findValidCategory(input.categoryId, categories);
    const resultCategory = this.findValidCategory(result.suggestedCategoryId, categories);
    const fallbackCategory = this.findValidCategory(fallback.suggestedCategoryId, categories);
    const emergencyCategory = emergency?.categoryCode ? categories.find((category) => category.code === emergency.categoryCode) ?? null : null;
    const category = emergencyCategory ?? resultCategory ?? fallbackCategory ?? currentCategory;
    const currentService = this.findValidService(input.serviceId, category, services);
    const resultService = this.findValidService(result.suggestedServiceId, category, services);
    const fallbackService = this.findValidService(fallback.suggestedServiceId, category, services);
    const service = resultService ?? fallbackService ?? currentService;
    const urgency = emergency
      ? "EMERGENCY"
      : this.isUrgency(result.suggestedUrgency)
        ? result.suggestedUrgency
        : input.urgency ?? fallback.suggestedUrgency;
    const budget = this.toValidBudget(result.estimatedPriceMin, result.estimatedPriceMax, fallback.suggestedBudgetRange);
    const improvedDescription = this.cleanImprovedDescription(result.improvedDescription, input.description, category?.name ?? null, service?.name ?? null, 15, 2000);
    if (!improvedDescription) {
      throw new GroqAnalyzerError("business validation", "Invalid improvedDescription");
    }
    const suggestedTitle = this.cleanText(result.suggestedTitle, 1, 120) ?? fallback.suggestedTitle;
    const urgencyReason = this.replaceUrgencyCodes(emergency?.reason ?? this.cleanText(result.urgencyReason, 12, 500) ?? fallback.urgencyReason);
    const rawSafetyWarning = emergency?.safetyWarning ?? this.cleanOptionalText(result.safetyWarning, 600) ?? fallback.safetyWarning;
    const safetyWarning = rawSafetyWarning ? this.replaceUrgencyCodes(rawSafetyWarning) : null;
    const detectedWorkType = service?.name ?? category?.name ?? fallback.detectedWorkType;
    const professionalInformationNeeded = this.cleanProfessionalInformationNeeded(result.professionalInformationNeeded, fallback.professionalInformationNeeded);

    return {
      ...fallback,
      detectedWorkType,
      fallbackUsed: false,
      improvedDescription,
      model,
      professionalInformationNeeded,
      provider: "groq",
      safetyWarning,
      suggestedBudgetRange: budget,
      suggestedCategoryCode: category?.code ?? null,
      suggestedCategoryId: category?.id ?? null,
      suggestedCategoryName: category?.name ?? null,
      suggestedServiceId: service?.id ?? null,
      suggestedServiceName: service?.name ?? null,
      suggestedServiceSlug: service?.slug ?? null,
      suggestedTitle,
      suggestedUrgency: urgency,
      urgencyReason,
      summary: `${detectedWorkType}: ${input.description}. Urgencia ${URGENCY_LABELS[urgency]}.`
    };
  }

  private findValidCategory(value: number | string | null | undefined, categories: ActiveCategory[]) {
    const id = this.parsePositiveInt(value);
    if (!id) return null;

    return categories.find((category) => category.id === id) ?? null;
  }

  private findValidService(value: number | string | null | undefined, category: ActiveCategory | null, services: ActiveService[]) {
    const id = this.parsePositiveInt(value);
    if (!id || !category) return null;

    return services.find((service) => service.id === id && service.categoryId === category.id) ?? null;
  }

  private parsePositiveInt(value: number | string | null | undefined) {
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }

  private isUrgency(value: unknown): value is ServiceRequestAiUrgency {
    return typeof value === "string" && URGENCIES.includes(value as ServiceRequestAiUrgency);
  }

  private toValidBudget(min: unknown, max: unknown, fallback: BudgetRangeSuggestion): BudgetRangeSuggestion {
    if (typeof min !== "number" || typeof max !== "number" || !Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max <= 0 || min > max) {
      return fallback;
    }

    return {
      confidence: "MEDIUM",
      currency: "EUR",
      min: Math.round(min),
      max: Math.round(max)
    };
  }

  private cleanText(value: unknown, minLength: number, maxLength: number) {
    if (typeof value !== "string") return null;
    const cleanValue = value.replace(/\s+/g, " ").trim();
    if (cleanValue.length < minLength) return null;
    return cleanValue.slice(0, maxLength);
  }

  private cleanImprovedDescription(
    value: unknown,
    originalDescription: string,
    categoryName: string | null,
    serviceName: string | null,
    minLength: number,
    maxLength: number
  ) {
    const cleanValue = this.cleanText(value, minLength, maxLength);
    if (!cleanValue) return null;

    const sanitized = cleanValue
      .replace(/\bTipo de trabajo:\s*[^.?!]+[.?!]?\s*/gi, "")
      .replace(/\bNecesidad indicada por el cliente:\s*/gi, "")
      .replace(/\bUrgencia sugerida:\s*(LOW|NORMAL|HIGH|EMERGENCY)\.?\s*/gi, "")
      .replace(/\b(LOW|NORMAL|HIGH|EMERGENCY)\b/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength);

    if (sanitized.length < minLength) return null;
    if (!this.isUsefulDescription(sanitized, originalDescription)) return null;
    if (this.startsWithCatalogLabel(sanitized, categoryName) || this.startsWithCatalogLabel(sanitized, serviceName)) return null;
    if (this.containsInternalLabels(sanitized)) return null;
    if (this.containsBrokenText(sanitized)) return null;
    if (!/[.!?]$/.test(sanitized)) return null;

    return sanitized;
  }

  private isUsefulDescription(value: string, originalDescription: string) {
    const normalizedValue = this.normalizeText(value);
    const normalizedOriginal = this.normalizeText(originalDescription);
    if (!normalizedValue || normalizedValue === normalizedOriginal) return false;
    if (normalizedOriginal.length < 35 && normalizedValue.includes(normalizedOriginal) && normalizedValue.length <= normalizedOriginal.length + 10) return false;
    if (value.trim().split(/\s+/).length < Math.max(5, Math.min(10, originalDescription.trim().split(/\s+/).length + 2))) return false;
    return /[a-záéíóúñü]{2,}\s+[a-záéíóúñü]{2,}/i.test(value);
  }

  private containsInternalLabels(value: string) {
    return /\b(Tipo de trabajo|Urgencia sugerida|Necesidad indicada por el cliente)\s*:/i.test(value);
  }

  private containsBrokenText(value: string) {
    const normalizedValue = this.normalizeText(value);
    if (["nosemonta", "no se monta", "ayuda no", "compre muebles ayuda"].some((fragment) => normalizedValue.includes(fragment))) return true;

    return value
      .split(/\s+/)
      .some((word) => word.length > 22 || /[bcdfghjklmnpqrstvwxyz]{6,}/i.test(word) || /(.)\1{4,}/i.test(word));
  }

  private cleanProfessionalInformationNeeded(value: unknown, fallback: string[]): string[] {
    const source = Array.isArray(value) ? value : fallback;
    const cleanItems = source
      .map((item) => this.cleanText(item, 6, 140))
      .filter((item): item is string => Boolean(item))
      .filter((item) => !this.containsBrokenText(item) && !this.containsInternalLabels(item));

    const uniqueItems = Array.from(new Set(cleanItems)).slice(0, 4);
    if (uniqueItems.length > 0 || source === fallback) return uniqueItems;

    return this.cleanProfessionalInformationNeeded(fallback, fallback);
  }

  private startsWithCatalogLabel(value: string, label: string | null) {
    if (!label) return false;
    const normalizedValue = this.normalizeText(value);
    const normalizedLabel = this.normalizeText(label);
    return normalizedValue.startsWith(`${normalizedLabel}:`) || normalizedValue.startsWith(`${normalizedLabel} -`);
  }

  private replaceUrgencyCodes(value: string) {
    return value.replace(/\b(LOW|NORMAL|HIGH|EMERGENCY)\b/g, (match) => URGENCY_LABELS[match as ServiceRequestAiUrgency]);
  }

  private cleanOptionalText(value: unknown, maxLength: number) {
    if (typeof value !== "string") return null;
    const cleanValue = value.replace(/\s+/g, " ").trim();
    return cleanValue ? cleanValue.slice(0, maxLength) : null;
  }

  private detectEmergencyOverride(description: string) {
    const normalizedDescription = this.normalizeText(description);
    const hasTrappedPerson = ["persona atrapada", "persona atrapado", "atrapado", "atrapada", "atrapando", "aplastado", "aplastada", "aplastando"].some((keyword) =>
      normalizedDescription.includes(keyword)
    );
    const hasHeavyObjectOnPerson = ["objeto pesado encima", "mueble encima", "armario encima", "estanteria encima"].some((keyword) =>
      normalizedDescription.includes(keyword)
    );
    const hasVulnerablePerson = ["bebe", "hijo", "hija", "nino", "nina", "menor", "adulto mayor", "persona mayor", "persona vulnerable"].some((keyword) =>
      normalizedDescription.includes(keyword)
    );
    const hasBlockedAccess = [
      "no puedo entrar",
      "no tengo como entrar",
      "no hay como entrar",
      "quedo adentro",
      "quedo dentro",
      "se quedo adentro",
      "se quedo dentro",
      "encerrado",
      "encerrada"
    ].some((keyword) => normalizedDescription.includes(keyword));
    const hasFlood = [
      "inundacion",
      "inundado",
      "inundada",
      "agua entrando",
      "agua esta entrando",
      "se esta metiendo el agua",
      "muebles flotando",
      "flotan los muebles",
      "agua subiendo"
    ].some((keyword) => normalizedDescription.includes(keyword));
    const hasFireGasSmokeSpark = ["olor a gas", "humo", "fuego", "incendio", "chispa", "chispas"].some((keyword) => normalizedDescription.includes(keyword));

    if (hasVulnerablePerson && hasBlockedAccess) {
      return {
        categoryCode: "LOCKSMITH",
        reason: "Se detecta un menor o persona vulnerable encerrada, lo que requiere atencion inmediata.",
        safetyWarning: "Contacta inmediatamente con el 112 si hay una persona vulnerable encerrada o en riesgo. FixGo no sustituye a los servicios de emergencia."
      };
    }

    if (hasTrappedPerson || hasHeavyObjectOnPerson) {
      return {
        categoryCode: "HANDYMAN",
        reason: "Se detecta una persona atrapada, aplastada o con un objeto pesado encima, con riesgo inmediato.",
        safetyWarning: "Contacta inmediatamente con el 112 si hay una persona atrapada o aplastada. FixGo no sustituye a los servicios de emergencia."
      };
    }

    if (hasFlood) {
      return {
        categoryCode: "PLUMBING",
        reason: "Se detecta una inundacion activa entrando en la vivienda, con riesgo inmediato para la vivienda.",
        safetyWarning: "Si el agua sigue entrando o hay riesgo para personas, contacta inmediatamente con el 112. FixGo no sustituye a los servicios de emergencia."
      };
    }

    if (hasFireGasSmokeSpark) {
      return {
        categoryCode: "ELECTRICITY",
        reason: "Se detectan senales de gas, humo, fuego o chispas con riesgo inmediato.",
        safetyWarning: "Contacta inmediatamente con el 112 y evita manipular instalaciones si hay gas, humo, fuego o chispas. FixGo no sustituye a los servicios de emergencia."
      };
    }

    return null;
  }

  private async buildFallback(input: AnalyzeServiceRequestInput, categories: ActiveCategory[], services: ActiveService[]) {
    const analysis = this.withFallbackMetadata(await this.fallbackAnalyzer.analyze(input));
    const category = analysis.suggestedCategoryCode
      ? categories.find((activeCategory) => activeCategory.code === analysis.suggestedCategoryCode) ?? null
      : null;
    const service = category ? this.findBestServiceForFallback(analysis.detectedWorkType, category, services) : null;

    return {
      ...analysis,
      detectedWorkType: service?.name ?? category?.name ?? analysis.detectedWorkType,
      suggestedCategoryCode: category?.code ?? analysis.suggestedCategoryCode,
      suggestedCategoryId: category?.id ?? analysis.suggestedCategoryId,
      suggestedCategoryName: category?.name ?? analysis.suggestedCategoryName,
      suggestedServiceId: service?.id ?? analysis.suggestedServiceId,
      suggestedServiceName: service?.name ?? analysis.suggestedServiceName,
      suggestedServiceSlug: service?.slug ?? analysis.suggestedServiceSlug
    };
  }

  private findBestServiceForFallback(workType: string, category: ActiveCategory, services: ActiveService[]) {
    const categoryServices = services.filter((service) => service.categoryId === category.id);
    if (categoryServices.length === 0) return null;

    const normalizedWorkType = this.normalizeText(workType);
    const directMatch = categoryServices.find((service) => normalizedWorkType && this.normalizeText(service.name).includes(normalizedWorkType));
    if (directMatch) return directMatch;

    if (category.code === "LOCKSMITH") {
      return categoryServices.find((service) => service.code === "LOCK_OPENING") ?? categoryServices[0];
    }

    if (category.code === "PLUMBING") {
      return categoryServices.find((service) => service.code === "PLUMBING_LEAK") ?? categoryServices[0];
    }

    return categoryServices[0];
  }

  private normalizeText(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  private withFallbackMetadata(analysis: ServiceRequestAiAnalysis): ServiceRequestAiAnalysis {
    return {
      ...analysis,
      fallbackUsed: true,
      model: null,
      provider: "local-fallback"
    };
  }

  private logSafeFailure(error: unknown, model: string, attempt: number) {
    if (process.env.NODE_ENV === "production") return;

    const stage = error instanceof GroqAnalyzerError ? error.stage : "request";
    const httpStatus = error instanceof GroqAnalyzerError ? error.httpStatus : undefined;
    const message = this.sanitizeTechnicalMessage(error);

    console.warn("[FixGo IA] Groq analysis failed", {
      attempt,
      httpStatus,
      model,
      provider: "groq",
      stage,
      technicalMessage: message
    });
  }

  private sanitizeTechnicalMessage(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return message
      .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
      .replace(/(api[_-]?key|token|secret|authorization)\s*[:=]\s*[^,\s}]+/gi, "$1=[redacted]")
      .replace(/\s+/g, " ")
      .slice(0, 180);
  }
}
