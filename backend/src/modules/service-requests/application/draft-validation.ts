import { BadRequestException, NotFoundException } from "@nestjs/common";
import {
  SERVICE_REQUEST_URGENCY,
  ServiceRequestEntity,
  ServiceRequestUrgency
} from "../domain/service-request.entity";
import {
  ServiceRequestsRepository,
  UpdateServiceRequestDraftData
} from "../domain/service-requests.repository";

export type DraftInput = {
  categoryId: number;
  serviceId?: number | null;
  title?: string | null;
  originalDescription: string;
  locationDescription: string;
  postalCode?: string | null;
  urgency: ServiceRequestUrgency;
  preferredDateFrom?: string | null;
  preferredDateTo?: string | null;
  flexibleSchedule: boolean;
  budgetMin?: number | null;
  budgetMax?: number | null;
  aiAssisted?: boolean;
};

const URGENCIES = Object.values(SERVICE_REQUEST_URGENCY);
const spanishLocationMessage = "Introduce una ubicaci\u00f3n y un c\u00f3digo postal v\u00e1lidos de Espa\u00f1a.";
const categoryTermsByCode: Record<string, string[]> = {
  AIR_CONDITIONING: ["climatizacion"],
  APPLIANCES: ["electrodomesticos"],
  AWNINGS_BLINDS: ["toldos", "persianas"],
  CONSTRUCTION: ["construccion"],
  ELECTRICITY: ["electricidad"],
  GLAZING: ["cristaleria"],
  HANDYMAN: ["manitas"],
  LOCKSMITH: ["cerrajeria"],
  MASONRY: ["albanileria"],
  METAL_CARPENTRY: ["carpinteria de metal"],
  PAINTING: ["pintura", "pintura interior", "pintura exterior"],
  PLUMBING: ["fontaneria"],
  RENOVATIONS: ["reformas"],
  WOOD_CARPENTRY: ["carpinteria de madera"]
};

export async function ensureClientProfile(
  serviceRequestsRepository: ServiceRequestsRepository,
  clientUserId: number
) {
  const exists = await serviceRequestsRepository.clientProfileExists(clientUserId);

  if (!exists) {
    throw new NotFoundException("Perfil de cliente no encontrado.");
  }
}

export async function validateDraftInput(
  serviceRequestsRepository: ServiceRequestsRepository,
  input: DraftInput
): Promise<UpdateServiceRequestDraftData> {
  if (!Number.isInteger(input.categoryId) || input.categoryId < 1) {
    throw new BadRequestException("La categor\u00eda seleccionada no es v\u00e1lida.");
  }

  const category = await serviceRequestsRepository.findActiveCategoryById(input.categoryId);

  if (!category?.active) {
    throw new BadRequestException("La categor\u00eda seleccionada no est\u00e1 disponible.");
  }

  if (input.serviceId !== null && input.serviceId !== undefined) {
    if (!Number.isInteger(input.serviceId) || input.serviceId < 1) {
      throw new BadRequestException("El servicio seleccionado no es v\u00e1lido.");
    }

    const service = await serviceRequestsRepository.findActiveServiceById(input.serviceId);

    if (!service?.active) {
      throw new BadRequestException("El servicio seleccionado no est\u00e1 disponible.");
    }

    if (service.categoryId !== input.categoryId) {
      throw new BadRequestException("El servicio seleccionado no pertenece a la categor\u00eda indicada.");
    }
  }

  const title = normalizeOptionalText(input.title);
  const originalDescription = normalizeRequiredText(input.originalDescription);
  const locationDescription = normalizeRequiredText(input.locationDescription);

  if (title && title.length > 120) {
    throw new BadRequestException("El t\u00edtulo no puede superar 120 caracteres.");
  }

  if (originalDescription.length < 15 || originalDescription.length > 2000) {
    throw new BadRequestException("La descripci\u00f3n debe tener entre 15 y 2000 caracteres.");
  }

  const locationWithoutPostalCode = removePostalCode(locationDescription);
  if (locationWithoutPostalCode.length < 3 || locationDescription.length > 240 || !hasValidSpanishPostalCode(locationDescription, input.postalCode)) {
    throw new BadRequestException(spanishLocationMessage);
  }

  if (!URGENCIES.includes(input.urgency)) {
    throw new BadRequestException("La urgencia seleccionada no es v\u00e1lida.");
  }

  validateDescriptionCategoryConsistency(originalDescription, category.code);
  const { budgetMin, budgetMax } = validateBudgetRange(input.budgetMin, input.budgetMax);

  validateDates(input.preferredDateFrom, input.preferredDateTo, input.flexibleSchedule);

  return {
    categoryId: input.categoryId,
    serviceId: input.serviceId ?? null,
    title,
    originalDescription,
    locationDescription,
    urgency: input.urgency,
    preferredDateFrom: input.preferredDateFrom ?? null,
    preferredDateTo: input.preferredDateTo ?? null,
    flexibleSchedule: input.flexibleSchedule,
    budgetMin,
    budgetMax,
    aiAssisted: Boolean(input.aiAssisted)
  };
}

export function combineDraft(
  current: ServiceRequestEntity,
  changes: Partial<DraftInput>
): DraftInput {
  return {
    categoryId: changes.categoryId ?? current.categoryId ?? 0,
    serviceId: changes.serviceId === undefined ? current.serviceId : changes.serviceId,
    title: changes.title === undefined ? current.title : changes.title,
    originalDescription: changes.originalDescription ?? current.originalDescription,
    locationDescription: changes.locationDescription ?? current.locationDescription ?? "",
    postalCode: changes.postalCode,
    urgency: changes.urgency ?? current.urgency,
    preferredDateFrom: changes.preferredDateFrom === undefined ? current.preferredDateFrom : changes.preferredDateFrom,
    preferredDateTo: changes.preferredDateTo === undefined ? current.preferredDateTo : changes.preferredDateTo,
    flexibleSchedule: changes.flexibleSchedule ?? current.flexibleSchedule,
    budgetMin: changes.budgetMin === undefined ? current.budgetMin : changes.budgetMin,
    budgetMax: changes.budgetMax === undefined ? current.budgetMax : changes.budgetMax,
    aiAssisted: changes.aiAssisted ?? current.aiAssisted
  };
}

function validateBudgetRange(budgetMin: number | null | undefined, budgetMax: number | null | undefined) {
  const normalizedMin = budgetMin ?? null;
  const normalizedMax = budgetMax ?? null;

  if (normalizedMin === null && normalizedMax === null) {
    return { budgetMin: null, budgetMax: null };
  }

  if (normalizedMin === null || normalizedMax === null) {
    throw new BadRequestException("El precio orientativo debe incluir m\u00ednimo y m\u00e1ximo.");
  }

  if (!Number.isFinite(normalizedMin) || !Number.isFinite(normalizedMax) || normalizedMin <= 0 || normalizedMax <= 0) {
    throw new BadRequestException("El precio orientativo debe tener valores positivos.");
  }

  if (normalizedMin > normalizedMax) {
    throw new BadRequestException("El precio orientativo m\u00ednimo no puede superar el m\u00e1ximo.");
  }

  return { budgetMin: normalizedMin, budgetMax: normalizedMax };
}

function hasValidSpanishPostalCode(locationDescription: string, postalCode?: string | null) {
  const locationMatch = locationDescription.match(/\b\d{5}\b/);
  const candidate = postalCode?.trim() || locationMatch?.[0] || "";
  if (!/^\d{5}$/.test(candidate)) return false;

  const prefix = Number(candidate.slice(0, 2));
  return prefix >= 1 && prefix <= 52;
}

function removePostalCode(locationDescription: string) {
  return locationDescription.replace(/\b\d{5}\b/g, "").replace(/[()]/g, " ").replace(/\s+/g, " ").trim();
}

function validateDescriptionCategoryConsistency(originalDescription: string, selectedCategoryCode: string) {
  const normalizedDescription = normalizeText(originalDescription);
  const selectedTerms = categoryTermsByCode[selectedCategoryCode] ?? [];
  const selectedTermSet = new Set(selectedTerms);

  const mentionsDifferentCategory = Object.entries(categoryTermsByCode).some(([code, terms]) => {
    if (code === selectedCategoryCode) return false;
    return terms.some((term) => !selectedTermSet.has(term) && normalizedDescription.includes(term));
  });

  if (mentionsDifferentCategory) {
    throw new BadRequestException("La descripci\u00f3n contiene una categor\u00eda diferente a la seleccionada.");
  }
}

function normalizeRequiredText(value: string): string {
  return value.trim();
}

function normalizeOptionalText(value?: string | null): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function validateDates(preferredDateFrom: string | null | undefined, preferredDateTo: string | null | undefined, flexibleSchedule: boolean) {
  if (!flexibleSchedule && !preferredDateFrom) {
    throw new BadRequestException("Indica una fecha inicial para un horario no flexible.");
  }

  if (preferredDateFrom && !isValidDateInput(preferredDateFrom)) {
    throw new BadRequestException("La fecha inicial no es v\u00e1lida.");
  }

  if (preferredDateTo && !isValidDateInput(preferredDateTo)) {
    throw new BadRequestException("La fecha final no es v\u00e1lida.");
  }

  const today = todayAsDateInput();

  if (preferredDateFrom && preferredDateFrom < today) {
    throw new BadRequestException("La fecha inicial no puede estar en el pasado.");
  }

  if (preferredDateTo && preferredDateTo < today) {
    throw new BadRequestException("La fecha final no puede estar en el pasado.");
  }

  if (preferredDateFrom && preferredDateTo && preferredDateTo < preferredDateFrom) {
    throw new BadRequestException("La fecha final no puede ser anterior a la fecha inicial.");
  }
}

function isValidDateInput(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function todayAsDateInput(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
