import { fallbackCategories, fallbackProfessionals, iconByName, type UiCategory, type UiProfessional } from "./data";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:3000/api";

type ApiCategory = {
  id: number;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  iconName: string | null;
};

type ApiProfessional = {
  id: number;
  displayName: string;
  businessName: string | null;
  location: string | null;
  verified: boolean;
  homologated: boolean;
  ratingAverage: number;
  completedJobsCount: number;
  trade: string;
};

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`API ${path} respondio con ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getCategories(): Promise<UiCategory[]> {
  try {
    const categories = await fetchJson<ApiCategory[]>("/categories");

    if (!categories.length) return fallbackCategories;

    return categories.map((category) => ({
      id: category.id,
      code: category.code,
      name: category.name,
      slug: category.slug,
      description: category.description,
      iconName: category.iconName,
      icon: iconByName[category.iconName ?? ""] ?? fallbackCategories[0].icon
    }));
  } catch {
    return fallbackCategories;
  }
}

export async function getProfessionals(): Promise<UiProfessional[]> {
  try {
    const professionals = await fetchJson<ApiProfessional[]>("/professionals");

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
  } catch {
    return fallbackProfessionals;
  }
}
