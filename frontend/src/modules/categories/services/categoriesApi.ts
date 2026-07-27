import { httpGet } from "../../../shared/http/httpClient";
import { fallbackCategories, iconByName } from "../data/categoryFallbacks";
import type { ApiCategory, UiCategory } from "../types/category";

export async function getCategories(): Promise<UiCategory[]> {
  const categories = await httpGet<ApiCategory[]>("/categories?scope=marketplace");

  return categories.map((category) => ({
    id: category.id,
    code: category.code,
    name: category.name,
    slug: category.slug,
    description: category.description,
    iconName: category.iconName,
    icon: iconByName[category.iconName ?? ""] ?? fallbackCategories[0].icon,
    sortOrder: category.sortOrder,
    active: category.active
  }));
}
