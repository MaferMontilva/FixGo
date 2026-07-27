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

type OpenAiJsonResult = {
  estimatedPriceMax?: number | null;
  estimatedPriceMin?: number | null;
  improvedDescription?: string | null;
  safetyWarning?: string | null;
  suggestedCategoryId?: number | string | null;
  suggestedServiceId?: number | string | null;
  suggestedTitle?: string | null;
  suggestedUrgency?: string | null;
  urgencyReason?: string | null;
};

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const OPENAI_TIMEOUT_MS = 15000;
const URGENCIES: ServiceRequestAiUrgency[] = ["LOW", "NORMAL", "HIGH", "EMERGENCY"];
const URGENCY_LABELS: Record<ServiceRequestAiUrgency, string> = {
  EMERGENCY: "Emergencia",
  HIGH: "Alta",
  LOW: "Baja",
  NORMAL: "Normal"
};

@Injectable()
export class OpenAiServiceRequestAiAnalyzer implements ServiceRequestAiAnalyzer {
  private readonly fallbackAnalyzer = new RuleBasedServiceRequestAiAnalyzer();

  constructor(private readonly prisma: PrismaService) {}

  async analyze(input: AnalyzeServiceRequestInput): Promise<ServiceRequestAiAnalysis> {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    const model = process.env.OPENAI_MODEL?.trim();
    const catalog = await this.loadCatalog();
    const fallback = await this.buildFallback(input, catalog.categories, catalog.services);

    if (!apiKey || !model) {
      return fallback;
    }

    try {
      const openAiResult = await this.requestOpenAi(input, catalog.categories, catalog.services, apiKey, model);
      const analysis = this.toValidatedAnalysis(openAiResult, input, fallback, catalog.categories, catalog.services, model);

      return analysis;
    } catch {
      return fallback;
    }
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
    const categories = await this.prisma.categories.findMany({
      where: { isActive: 1 },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
        slug: true
      }
    });

    return categories;
  }

  private async findActiveServices(): Promise<ActiveService[]> {
    const activeCategories = await this.prisma.categories.findMany({
      where: { isActive: 1 },
      select: { id: true }
    });
    const activeCategoryIds = activeCategories.map((category) => category.id);

    if (activeCategoryIds.length === 0) return [];

    const services = await this.prisma.services.findMany({
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

    return services;
  }

  private async requestOpenAi(
    input: AnalyzeServiceRequestInput,
    categories: ActiveCategory[],
    services: ActiveService[],
    apiKey: string,
    model: string
  ): Promise<OpenAiJsonResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

    try {
      const response = await fetch(OPENAI_RESPONSES_URL, {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          input: [
            {
              role: "system",
              content: [
                {
                  type: "input_text",
                  text:
                    "Eres FixGo IA. Analiza solicitudes de servicios del hogar en Espana. Devuelve solo JSON valido. No publiques, no guardes, no selecciones profesionales y no garantices precios. Usa exclusivamente las urgencias LOW, NORMAL, HIGH, EMERGENCY. improvedDescription debe ser solo una redaccion clara del problema, sin etiquetas como Tipo de trabajo, Necesidad indicada por el cliente o Urgencia sugerida, y sin mostrar codigos internos."
                }
              ]
            },
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: JSON.stringify({
                    currentRequest: {
                      title: input.title ?? null,
                      description: input.description,
                      categoryId: input.categoryId ?? null,
                      categoryName: input.categoryName ?? null,
                      serviceId: input.serviceId ?? null,
                      serviceName: input.serviceName ?? null,
                      urgency: input.urgency ?? null
                    },
                    activeCategories: categories,
                    activeServices: services,
                    businessRules: [
                      "Bebe, nino, adulto mayor o persona vulnerable encerrada: EMERGENCY.",
                      "Persona atrapada o acceso bloqueado con riesgo: EMERGENCY.",
                      "Inundacion entrando en la vivienda: EMERGENCY.",
                      "Gas, humo, fuego o chispas: EMERGENCY.",
                      "Fuga activa sin riesgo inmediato confirmado: HIGH.",
                      "Cliente fuera de casa, pero todos estan seguros: HIGH o NORMAL segun contexto.",
                      "Cambio preventivo o mantenimiento: NORMAL o LOW.",
                      "El precio es orientativo de FixGo IA, no presupuesto profesional ni garantia."
                    ],
                    requiredJsonShape: {
                      suggestedTitle: "string",
                      improvedDescription: "string",
                      suggestedCategoryId: "string o null",
                      suggestedServiceId: "string o null",
                      suggestedUrgency: "LOW | NORMAL | HIGH | EMERGENCY | null",
                      urgencyReason: "string",
                      estimatedPriceMin: "number o null",
                      estimatedPriceMax: "number o null",
                      safetyWarning: "string o null"
                    }
                  })
                }
              ]
            }
          ],
          text: {
            format: {
              type: "json_schema",
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
                  suggestedUrgency: { anyOf: [{ type: "string", enum: URGENCIES }, { type: "null" }] },
                  urgencyReason: { type: "string" },
                  estimatedPriceMin: { anyOf: [{ type: "number" }, { type: "null" }] },
                  estimatedPriceMax: { anyOf: [{ type: "number" }, { type: "null" }] },
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
                  "safetyWarning"
                ]
              }
            }
          }
        })
      });

      if (!response.ok) throw new Error("OpenAI HTTP error");

      const payload = (await response.json()) as unknown;
      const text = this.extractOutputText(payload);
      if (!text) throw new Error("OpenAI empty response");

      return JSON.parse(text) as OpenAiJsonResult;
    } finally {
      clearTimeout(timeout);
    }
  }

  private extractOutputText(payload: unknown): string {
    if (!payload || typeof payload !== "object") return "";
    const record = payload as { output?: unknown; output_text?: unknown };
    if (typeof record.output_text === "string") return record.output_text;
    if (!Array.isArray(record.output)) return "";

    for (const item of record.output) {
      if (!item || typeof item !== "object") continue;
      const content = (item as { content?: unknown }).content;
      if (!Array.isArray(content)) continue;

      for (const part of content) {
        if (!part || typeof part !== "object") continue;
        const text = (part as { text?: unknown }).text;
        if (typeof text === "string") return text;
      }
    }

    return "";
  }

  private toValidatedAnalysis(
    result: OpenAiJsonResult,
    input: AnalyzeServiceRequestInput,
    fallback: ServiceRequestAiAnalysis,
    categories: ActiveCategory[],
    services: ActiveService[],
    model: string
  ): ServiceRequestAiAnalysis {
    const resultCategory = this.findValidCategory(result.suggestedCategoryId, categories);
    const fallbackCategory = this.findValidCategory(fallback.suggestedCategoryId, categories);
    const category = resultCategory ?? fallbackCategory;
    const resultService = this.findValidService(result.suggestedServiceId, category, services);
    const fallbackService = this.findValidService(fallback.suggestedServiceId, category, services);
    const service = resultService ?? fallbackService;
    const urgency = this.isUrgency(result.suggestedUrgency) ? result.suggestedUrgency : input.urgency ?? fallback.suggestedUrgency;
    const budget = this.toValidBudget(result.estimatedPriceMin, result.estimatedPriceMax, fallback.suggestedBudgetRange);
    const improvedDescription = this.cleanDescriptionText(result.improvedDescription, 15, 2000) ?? fallback.improvedDescription;
    const suggestedTitle = this.cleanText(result.suggestedTitle, 1, 120) ?? fallback.suggestedTitle;
    const urgencyReason = this.replaceUrgencyCodes(this.cleanText(result.urgencyReason, 12, 500) ?? fallback.urgencyReason);
    const rawSafetyWarning = this.cleanOptionalText(result.safetyWarning, 600) ?? fallback.safetyWarning;
    const safetyWarning = rawSafetyWarning ? this.replaceUrgencyCodes(rawSafetyWarning) : null;
    const detectedWorkType = service?.name ?? category?.name ?? fallback.detectedWorkType;

    return {
      ...fallback,
      detectedWorkType,
      fallbackUsed: false,
      improvedDescription,
      model,
      provider: "openai",
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

  private cleanDescriptionText(value: unknown, minLength: number, maxLength: number) {
    const cleanValue = this.cleanText(value, minLength, maxLength);
    if (!cleanValue) return null;

    const sanitized = cleanValue
      .replace(/\bTipo de trabajo:\s*[^.?!]+[.?!]?\s*/gi, "")
      .replace(/\bNecesidad indicada por el cliente:\s*/gi, "")
      .replace(/\bUrgencia sugerida:\s*(LOW|NORMAL|HIGH|EMERGENCY)\.?\s*/gi, "")
      .replace(/\b(LOW|NORMAL|HIGH|EMERGENCY)\b/g, (match) => URGENCY_LABELS[match as ServiceRequestAiUrgency])
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength);

    return sanitized.length >= minLength ? sanitized : null;
  }

  private replaceUrgencyCodes(value: string) {
    return value.replace(/\b(LOW|NORMAL|HIGH|EMERGENCY)\b/g, (match) => URGENCY_LABELS[match as ServiceRequestAiUrgency]);
  }

  private cleanOptionalText(value: unknown, maxLength: number) {
    if (typeof value !== "string") return null;
    const cleanValue = value.replace(/\s+/g, " ").trim();
    return cleanValue ? cleanValue.slice(0, maxLength) : null;
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
}
