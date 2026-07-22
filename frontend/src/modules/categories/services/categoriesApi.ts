import { httpGet } from "../../../shared/http/httpClient";
import { fallbackCategories, iconByName } from "../data/categoryFallbacks";
import type { ApiCategory, UiCategory } from "../types/category";

export async function getCategories(): Promise<UiCategory[]> {
  try {
    const categories = await httpGet<ApiCategory[]>("/categories");

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
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("FixGo: usando categorías de demostración por error de API.", error);
    }

    return fallbackCategories;
  }
}
