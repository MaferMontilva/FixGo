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
  urgency: ServiceRequestUrgency;
  preferredDateFrom?: string | null;
  preferredDateTo?: string | null;
  flexibleSchedule: boolean;
};

const URGENCIES = Object.values(SERVICE_REQUEST_URGENCY);

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
    throw new BadRequestException("La categoría seleccionada no es válida.");
  }

  const category = await serviceRequestsRepository.findActiveCategoryById(input.categoryId);

  if (!category?.active) {
    throw new BadRequestException("La categoría seleccionada no está disponible.");
  }

  if (input.serviceId !== null && input.serviceId !== undefined) {
    if (!Number.isInteger(input.serviceId) || input.serviceId < 1) {
      throw new BadRequestException("El servicio seleccionado no es válido.");
    }

    const service = await serviceRequestsRepository.findActiveServiceById(input.serviceId);

    if (!service?.active) {
      throw new BadRequestException("El servicio seleccionado no está disponible.");
    }

    if (service.categoryId !== input.categoryId) {
      throw new BadRequestException("El servicio seleccionado no pertenece a la categoría indicada.");
    }
  }

  const title = normalizeOptionalText(input.title);
  const originalDescription = normalizeRequiredText(input.originalDescription);
  const locationDescription = normalizeRequiredText(input.locationDescription);

  if (title && title.length > 120) {
    throw new BadRequestException("El título no puede superar 120 caracteres.");
  }

  if (originalDescription.length < 15 || originalDescription.length > 2000) {
    throw new BadRequestException("La descripción debe tener entre 15 y 2000 caracteres.");
  }

  if (locationDescription.length < 3 || locationDescription.length > 240) {
    throw new BadRequestException("La ubicación debe tener entre 3 y 240 caracteres.");
  }

  if (!URGENCIES.includes(input.urgency)) {
    throw new BadRequestException("La urgencia seleccionada no es válida.");
  }

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
    flexibleSchedule: input.flexibleSchedule
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
    urgency: changes.urgency ?? current.urgency,
    preferredDateFrom: changes.preferredDateFrom === undefined ? current.preferredDateFrom : changes.preferredDateFrom,
    preferredDateTo: changes.preferredDateTo === undefined ? current.preferredDateTo : changes.preferredDateTo,
    flexibleSchedule: changes.flexibleSchedule ?? current.flexibleSchedule
  };
}

function normalizeRequiredText(value: string): string {
  return value.trim();
}

function normalizeOptionalText(value?: string | null): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function validateDates(preferredDateFrom: string | null | undefined, preferredDateTo: string | null | undefined, flexibleSchedule: boolean) {
  if (!flexibleSchedule && !preferredDateFrom) {
    throw new BadRequestException("Indica una fecha inicial para un horario no flexible.");
  }

  if (preferredDateFrom && !isValidDateInput(preferredDateFrom)) {
    throw new BadRequestException("La fecha inicial no es válida.");
  }

  if (preferredDateTo && !isValidDateInput(preferredDateTo)) {
    throw new BadRequestException("La fecha final no es válida.");
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
