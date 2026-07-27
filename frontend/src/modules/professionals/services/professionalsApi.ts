import { httpGet, httpPatch } from "../../../shared/http/httpClient";
import { fallbackProfessionals } from "../data/professionalFallbacks";
import type { ApiProfessional, UiProfessional } from "../types/professional";
import type { ProfessionalOpportunity, ProfessionalProfileApi, UpdateProfessionalProfilePayload } from "../types/professionalOnboarding";

export async function getProfessionals(): Promise<UiProfessional[]> {
  try {
    const professionals = await httpGet<ApiProfessional[]>("/professionals");

    if (!professionals.length) return fallbackProfessionals;

    return professionals.map((professional) => ({
      id: professional.id,
      name: professional.businessName ?? professional.displayName,
      trade: professional.trade,
      location: professional.location ?? "Ubicacion pendiente",
      verified: professional.verified || professional.homologated,
      homologated: professional.homologated,
      ratingAverage: professional.ratingAverage,
      completedJobsCount: professional.completedJobsCount
    }));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("FixGo: usando profesionales de demostración por error de API.", error);
    }

    return fallbackProfessionals;
  }
}

export function getMyProfessionalProfile() {
  return httpGet<ProfessionalProfileApi | null>("/professionals/me");
}

export function saveMyProfessionalProfile(payload: UpdateProfessionalProfilePayload) {
  return httpPatch<ProfessionalProfileApi, UpdateProfessionalProfilePayload>("/professionals/me", payload);
}

export function getProfessionalOpportunities() {
  return httpGet<ProfessionalOpportunity[]>("/professionals/me/opportunities");
}

export function getProfessionalOpportunity(id: number) {
  return httpGet<ProfessionalOpportunity>(`/professionals/me/opportunities/${id}`);
}
