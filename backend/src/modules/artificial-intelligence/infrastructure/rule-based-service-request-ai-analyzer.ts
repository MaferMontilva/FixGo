import { Injectable } from "@nestjs/common";
import {
  AnalyzeServiceRequestInput,
  BudgetRangeSuggestion,
  ServiceRequestAiAnalysis,
  ServiceRequestAiUrgency
} from "../domain/service-request-ai-analysis";
import { ServiceRequestAiAnalyzer } from "../domain/service-request-ai-analyzer";

type WorkProfile = {
  budget: BudgetRangeSuggestion;
  categoryCode: string;
  label: string;
  keywords: string[];
};

type UrgencySuggestion = {
  reason: string;
  urgency: ServiceRequestAiUrgency;
};

const WORK_PROFILES: WorkProfile[] = [
  {
    categoryCode: "PLUMBING",
    label: "Fontanería",
    keywords: ["agua", "fuga", "grifo", "tuberia", "atasco", "desague", "wc", "cisterna"],
    budget: { confidence: "MEDIUM", currency: "EUR", min: 60, max: 220 }
  },
  {
    categoryCode: "ELECTRICITY",
    label: "Electricidad",
    keywords: ["luz", "enchufe", "cuadro", "cable", "cortocircuito", "interruptor", "corriente"],
    budget: { confidence: "MEDIUM", currency: "EUR", min: 55, max: 180 }
  },
  {
    categoryCode: "CLIMATE",
    label: "Climatización",
    keywords: ["aire", "caldera", "radiador", "frio", "calor", "termostato"],
    budget: { confidence: "MEDIUM", currency: "EUR", min: 70, max: 260 }
  },
  {
    categoryCode: "LOCKSMITH",
    label: "Cerrajería",
    keywords: ["cerradura", "llave", "puerta", "bombin", "cerrojo", "entrar", "adentro", "encerrado", "encerrada"],
    budget: { confidence: "MEDIUM", currency: "EUR", min: 65, max: 210 }
  },
  {
    categoryCode: "HANDYMAN",
    label: "Manitas",
    keywords: ["mueble", "estanteria", "armario", "mesa", "objeto pesado", "montaje", "reparacion"],
    budget: { confidence: "MEDIUM", currency: "EUR", min: 50, max: 190 }
  }
];

const DEFAULT_BUDGET: BudgetRangeSuggestion = { confidence: "LOW", currency: "EUR", min: 45, max: 180 };

// Rangos de referencia por categoria (mercado espanol aproximado). Se usan como
// respaldo por categoria cuando la IA real no responde o no da un precio valido.
// Son valores orientativos, no precios cerrados. Ej.: una mudanza (sobre todo
// interprovincial) es mucho mas cara que una reparacion pequena.
const CATEGORY_BUDGETS: { keywords: string[]; budget: BudgetRangeSuggestion }[] = [
  { keywords: ["mudanza"], budget: { confidence: "LOW", currency: "EUR", min: 300, max: 1500 } },
  { keywords: ["pintura", "pintar"], budget: { confidence: "LOW", currency: "EUR", min: 150, max: 800 } },
  { keywords: ["jardin"], budget: { confidence: "LOW", currency: "EUR", min: 60, max: 300 } },
  { keywords: ["limpieza"], budget: { confidence: "LOW", currency: "EUR", min: 50, max: 200 } },
  { keywords: ["fontaneria", "fontanero"], budget: { confidence: "MEDIUM", currency: "EUR", min: 60, max: 250 } },
  { keywords: ["electricidad", "electrico"], budget: { confidence: "MEDIUM", currency: "EUR", min: 60, max: 250 } },
  { keywords: ["climatizacion", "aire", "caldera"], budget: { confidence: "MEDIUM", currency: "EUR", min: 70, max: 300 } },
  { keywords: ["cerrajeria", "cerrajero"], budget: { confidence: "MEDIUM", currency: "EUR", min: 70, max: 220 } },
  { keywords: ["manitas", "montaje"], budget: { confidence: "MEDIUM", currency: "EUR", min: 45, max: 180 } }
];

function budgetForCategory(categoryName?: string | null): BudgetRangeSuggestion | null {
  if (!categoryName) return null;
  const normalized = normalizeText(categoryName);
  const match = CATEGORY_BUDGETS.find((entry) => entry.keywords.some((keyword) => normalized.includes(keyword)));
  return match ? match.budget : null;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function compactText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function truncateText(value: string, maxLength: number) {
  const cleanValue = compactText(value);
  if (cleanValue.length <= maxLength) return cleanValue;
  return `${cleanValue.slice(0, maxLength - 1).trim()}...`;
}

function capitalizeSentence(value: string) {
  const cleanValue = compactText(value);
  if (!cleanValue) return "";
  return `${cleanValue.charAt(0).toUpperCase()}${cleanValue.slice(1)}`;
}

function urgencyLabel(urgency: ServiceRequestAiUrgency) {
  return {
    EMERGENCY: "Emergencia",
    HIGH: "Alta",
    LOW: "Baja",
    NORMAL: "Normal"
  }[urgency];
}

@Injectable()
export class RuleBasedServiceRequestAiAnalyzer implements ServiceRequestAiAnalyzer {
  async analyze(input: AnalyzeServiceRequestInput): Promise<ServiceRequestAiAnalysis> {
    const description = compactText(input.description);
    const normalizedDescription = normalizeText(description);
    const profile = this.detectWorkProfile(normalizedDescription, input.categoryName, input.serviceName);
    const urgencySuggestion = this.detectUrgency(normalizedDescription);
    const suggestedUrgency = urgencySuggestion.urgency;
    const missingInformation = this.detectMissingInformation(normalizedDescription);
    const professionalInformationNeeded = this.detectProfessionalInformationNeeded(normalizedDescription, profile);
    const suggestedCategoryName = this.resolveSuggestedCategoryName(input.categoryName, profile);
    const suggestedServiceName = this.resolveSuggestedServiceName(input.serviceName, suggestedCategoryName, profile);
    const suggestedTitle = this.buildTitle(input.title, suggestedServiceName, profile.label, description);
    const improvedDescription = this.buildImprovedDescription(input, suggestedServiceName ?? suggestedCategoryName ?? profile.label, suggestedUrgency);

    return {
      detectedWorkType: profile.label,
      fallbackUsed: true,
      improvedDescription,
      missingInformation,
      model: null,
      professionalInformationNeeded,
      provider: "local-fallback",
      recommendedNextStep: "Revisa las sugerencias y continua con ubicacion, fecha y urgencia.",
      safetyWarning: this.detectSafetyWarning(normalizedDescription, suggestedUrgency),
      suggestedCategoryCode: profile.categoryCode || null,
      suggestedCategoryId: suggestedCategoryName && normalizeText(suggestedCategoryName) === normalizeText(input.categoryName ?? "") ? input.categoryId ?? null : null,
      suggestedCategoryName: suggestedCategoryName ?? (profile.categoryCode ? profile.label : null),
      suggestedBudgetRange: this.adjustBudgetByUrgency(budgetForCategory(input.categoryName) ?? profile.budget, suggestedUrgency),
      suggestedServiceId: suggestedServiceName ? input.serviceId ?? null : null,
      suggestedServiceName,
      suggestedServiceSlug: null,
      suggestedTitle,
      suggestedUrgency,
      urgencyReason: urgencySuggestion.reason,
      summary: this.buildSummary(input, suggestedServiceName ?? suggestedCategoryName ?? profile.label, suggestedUrgency, description)
    };
  }

  private detectWorkProfile(normalizedDescription: string, categoryName?: string | null, serviceName?: string | null) {
    const normalizedContext = normalizeText(`${categoryName ?? ""} ${serviceName ?? ""}`);
    const searchableText = `${normalizedContext} ${normalizedDescription}`;

    return (
      WORK_PROFILES.find((profile) => profile.keywords.some((keyword) => searchableText.includes(keyword))) ?? {
        categoryCode: "",
        label: serviceName || categoryName || "Servicio del hogar",
        keywords: [],
        budget: DEFAULT_BUDGET
      }
    );
  }

  private resolveSuggestedCategoryName(categoryName: string | null | undefined, profile: WorkProfile) {
    if (!categoryName?.trim()) return null;
    if (!profile.categoryCode) return categoryName;

    const normalizedCategoryName = normalizeText(categoryName);
    const normalizedProfileLabel = normalizeText(profile.label);

    return normalizedCategoryName.includes(normalizedProfileLabel) || normalizedProfileLabel.includes(normalizedCategoryName) ? categoryName : null;
  }

  private resolveSuggestedServiceName(serviceName: string | null | undefined, categoryName: string | null, profile: WorkProfile) {
    if (!serviceName?.trim()) return null;
    if (!profile.categoryCode || !categoryName) return serviceName;

    const normalizedServiceName = normalizeText(serviceName);
    const normalizedProfileLabel = normalizeText(profile.label);
    const normalizedCategoryName = normalizeText(categoryName);

    if (normalizedServiceName.includes(normalizedProfileLabel) || normalizedProfileLabel.includes(normalizedServiceName)) {
      return serviceName;
    }

    if (normalizedServiceName.includes(normalizedCategoryName) || normalizedCategoryName.includes(normalizedServiceName)) {
      return serviceName;
    }

    return null;
  }

  private detectUrgency(normalizedDescription: string): UrgencySuggestion {
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
      "encerrada",
      "puerta bloqueada",
      "cerradura bloqueada"
    ].some((keyword) => normalizedDescription.includes(keyword));

    if (hasVulnerablePerson && hasBlockedAccess) {
      return {
        urgency: "EMERGENCY",
        reason: "Se detecta una persona vulnerable sola o encerrada con el acceso bloqueado, lo que puede requerir atención inmediata."
      };
    }

    if (
      [
        "atrapado",
        "atrapada",
        "atrapando",
        "aplastado",
        "aplastada",
        "aplastando",
        "persona atrapada",
        "persona atrapado",
        "objeto pesado encima",
        "mueble encima",
        "armario encima",
        "estanteria encima"
      ].some((keyword) => normalizedDescription.includes(keyword))
    ) {
      return {
        urgency: "EMERGENCY",
        reason: hasVulnerablePerson
          ? "Se detecta una persona menor o vulnerable atrapada por un objeto, con posible riesgo inmediato."
          : "Se detecta una persona atrapada o una situación de acceso bloqueado con posible riesgo inmediato."
      };
    }

    if (
      [
        "inundacion",
        "inundado",
        "inundada",
        "inundo",
        "se inundo",
        "agua a la casa",
        "agua en la casa",
        "agua entrando",
        "metiendo el agua",
        "se esta metiendo el agua",
        "muebles flotan",
        "flotan los muebles",
        "agua subiendo",
        "vivienda anegada",
        "casa anegada"
      ].some((keyword) => normalizedDescription.includes(keyword))
    ) {
      return {
        urgency: "EMERGENCY",
        reason: "Se detecta una inundación activa dentro de la vivienda que puede producir daños inmediatos."
      };
    }

    if (
      [
        "olor a gas",
        "gas",
        "chispa",
        "chispas",
        "humo",
        "fuego",
        "incendio"
      ].some((keyword) => normalizedDescription.includes(keyword))
    ) {
      return {
        urgency: "EMERGENCY",
        reason: "Se detectan señales de gas, humo, fuego o chispas con posible riesgo inmediato para personas o vivienda."
      };
    }

    if (["no puedo entrar", "no tengo como entrar", "no puedo cerrar", "puerta no cierra", "cerradura bloqueada"].some((keyword) => normalizedDescription.includes(keyword))) {
      return {
        urgency: "HIGH",
        reason: "Se detecta una incidencia de acceso o seguridad, sin señales claras de una persona atrapada o vulnerable en riesgo."
      };
    }

    if (
      ["fuga", "se bota", "mucha agua", "sale agua", "pierde agua", "gotea mucho", "agua abundante"].some((keyword) =>
        normalizedDescription.includes(keyword)
      )
    ) {
      return {
        urgency: "HIGH",
        reason: "Se detecta una posible fuga activa que podría aumentar los daños en la vivienda."
      };
    }

    if (["hoy", "cuanto antes", "rapido", "no funciona", "averia", "urgente"].some((keyword) => normalizedDescription.includes(keyword))) {
      return {
        urgency: "HIGH",
        reason: "La descripción sugiere una incidencia que podría afectar el uso normal del servicio."
      };
    }

    if (["cuando se pueda", "sin prisa", "mantenimiento"].some((keyword) => normalizedDescription.includes(keyword))) {
      return {
        urgency: "LOW",
        reason: "La descripción indica que el servicio puede esperar sin una actuación inmediata."
      };
    }

    return {
      urgency: "NORMAL",
      reason: "No se detectan señales claras de riesgo inmediato ni de que el daño vaya a aumentar rápidamente."
    };
  }

  private detectMissingInformation(normalizedDescription: string) {
    const missingInformation: string[] = [];

    if (!["cocina", "bano", "salon", "habitacion", "terraza", "garaje", "local", "piso", "casa"].some((keyword) => normalizedDescription.includes(keyword))) {
      missingInformation.push("zona exacta de la vivienda o local");
    }

    if (!["desde", "ayer", "hoy", "semana", "mes", "dias", "horas"].some((keyword) => normalizedDescription.includes(keyword))) {
      missingInformation.push("desde cuando ocurre el problema");
    }

    if (!["foto", "video", "marca", "modelo", "medida", "metros", "tamano"].some((keyword) => normalizedDescription.includes(keyword))) {
      missingInformation.push("detalle visual, medida, marca o modelo si aplica");
    }

    return missingInformation;
  }

  private detectProfessionalInformationNeeded(normalizedDescription: string, profile: WorkProfile) {
    const information: string[] = [];
    const isFurnitureAssembly =
      profile.categoryCode === "HANDYMAN" &&
      ["montar", "montaje", "instalar", "armar"].some((keyword) => normalizedDescription.includes(keyword)) &&
      ["mueble", "muebles", "armario", "estanteria", "cocina"].some((keyword) => normalizedDescription.includes(keyword));

    if (isFurnitureAssembly) {
      if (!/\b\d+\b/.test(normalizedDescription) && !["varios", "muchos", "pocos"].some((keyword) => normalizedDescription.includes(keyword))) {
        information.push("cantidad de muebles que deben montarse");
      }
      if (!["pared", "colgar", "fijar", "anclar"].some((keyword) => normalizedDescription.includes(keyword))) {
        information.push("si deben fijarse a la pared");
      }
      if (!["herrajes", "tornillos", "instrucciones", "manual"].some((keyword) => normalizedDescription.includes(keyword))) {
        information.push("si dispone de herrajes e instrucciones");
      }
      if (!["medida", "medidas", "dimension", "dimensiones", "metros", "alto", "ancho"].some((keyword) => normalizedDescription.includes(keyword))) {
        information.push("dimensiones aproximadas");
      }

      return information.slice(0, 4);
    }

    if (!["foto", "video", "imagen"].some((keyword) => normalizedDescription.includes(keyword))) {
      information.push("fotografias del estado actual, si es posible");
    }
    if (!["medida", "medidas", "dimension", "dimensiones", "metros", "tamano"].some((keyword) => normalizedDescription.includes(keyword))) {
      information.push("medidas aproximadas si afectan al trabajo");
    }
    if (!["marca", "modelo"].some((keyword) => normalizedDescription.includes(keyword))) {
      information.push("marca o modelo del elemento, si aplica");
    }
    if (!["desde", "ayer", "hoy", "semana", "mes", "dias", "horas"].some((keyword) => normalizedDescription.includes(keyword))) {
      information.push("desde cuando ocurre el problema");
    }

    return information.slice(0, 4);
  }

  private detectSafetyWarning(normalizedDescription: string, urgency: ServiceRequestAiUrgency) {
    if (urgency !== "EMERGENCY") return null;

    if (
      [
        "bebe",
        "hijo",
        "hija",
        "nino",
        "nina",
        "menor",
        "adulto mayor",
        "persona mayor",
        "atrapado",
        "atrapada",
        "atrapando",
        "aplastado",
        "aplastada",
        "aplastando",
        "objeto pesado encima",
        "mueble encima",
        "armario encima",
        "estanteria encima",
        "gas",
        "humo",
        "fuego",
        "chispa",
        "chispas",
        "inundacion",
        "agua entrando",
        "flotan los muebles"
    ].some((keyword) =>
        normalizedDescription.includes(keyword)
      )
    ) {
      if (["atrapado", "atrapada", "atrapando", "aplastado", "aplastada", "aplastando"].some((keyword) => normalizedDescription.includes(keyword))) {
        return "Contacta inmediatamente con el 112 si hay una persona atrapada o aplastada.";
      }

      return "Si existe riesgo inmediato para personas o vivienda, contacta con el 112 y no esperes únicamente una respuesta del marketplace.";
    }

    return null;
  }

  private buildTitle(title: string | null | undefined, serviceName: string | null | undefined, workType: string, description: string) {
    if (title?.trim()) return truncateText(capitalizeSentence(title), 120);
    if (serviceName?.trim()) return truncateText(`${capitalizeSentence(serviceName)} en domicilio`, 120);

    const firstSentence = description.split(/[.!?]/)[0] ?? "";
    if (firstSentence.trim().length >= 12) return truncateText(capitalizeSentence(firstSentence), 120);

    return truncateText(`${workType} en domicilio`, 120);
  }

  private buildImprovedDescription(input: AnalyzeServiceRequestInput, workType: string, _urgency: ServiceRequestAiUrgency) {
    const description = compactText(input.description);
    const normalizedDescription = normalizeText(description);

    if (normalizedDescription.includes("montar") && normalizedDescription.includes("mueble") && normalizedDescription.includes("cocina")) {
      return "Necesito realizar el montaje de los muebles de la cocina, que actualmente se encuentran desmontados.";
    }

    const core = this.stripEmotionalFiller(description);
    const base = normalizeText(core).replace(/[^a-z0-9]/g, "").length >= 8 ? core : description;
    const intro = compactText(workType);
    const professional = intro
      ? `Se solicita un servicio profesional relacionado con ${intro.toLowerCase()}. ${capitalizeSentence(base)}`
      : `Se solicita un servicio profesional para el siguiente trabajo: ${capitalizeSentence(base)}`;
    const withPeriod = /[.!?]$/.test(professional) ? professional : `${professional}.`;

    return truncateText(withPeriod, 2000);
  }

  private stripEmotionalFiller(value: string) {
    let text = value;
    const fillerPhrases: RegExp[] = [
      /\bno s[eé] qu[eé] hacer\b/gi,
      /\bno tengo nada\b/gi,
      /\bme siento sol[oa]\b/gi,
      /\bcon (mucho )?miedo\b/gi,
      /\btengo (mucho )?miedo\b/gi,
      /\bestoy (muy )?desesperad[oa]\b/gi,
      /\bno aguanto (mas|más)\b/gi,
      /\bpor favor\b/gi,
      /\bay[uú]d[ae]nme\b/gi
    ];
    for (const phrase of fillerPhrases) text = text.replace(phrase, " ");
    text = text.replace(/^\s*(necesito ayuda con|necesito que me ayuden con|ayuda con)\s+/i, "");

    const fragments = text
      .split(/(?<=[.!?])\s+/)
      .map((fragment) => this.tidyFragment(fragment))
      .filter((fragment) => normalizeText(fragment).replace(/[^a-z0-9]/g, "").length >= 6);

    const joined = fragments.map((fragment) => capitalizeSentence(fragment)).join(". ");
    return compactText(joined);
  }

  private tidyFragment(fragment: string) {
    return compactText(fragment)
      .replace(/^[\s,;.]+/, "")
      .replace(/[\s,;.]+$/, "")
      .replace(/\s+(y|porque|pero|o)\s*$/i, "")
      .replace(/^(y|porque|pero|o)\s+/i, "")
      .replace(/\s+([,;.])/g, "$1")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  private buildSummary(input: AnalyzeServiceRequestInput, workType: string, urgency: ServiceRequestAiUrgency, description: string) {
    return truncateText(`${workType}: ${description}. Urgencia ${urgencyLabel(urgency)}.`, 260);
  }

  private adjustBudgetByUrgency(budget: BudgetRangeSuggestion, urgency: ServiceRequestAiUrgency) {
    if (urgency !== "EMERGENCY") return budget;

    return {
      ...budget,
      max: Math.round(budget.max * 1.25),
      min: Math.round(budget.min * 1.15)
    };
  }
}
