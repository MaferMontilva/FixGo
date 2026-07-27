import { httpGet } from "../../../shared/http/httpClient";
import type { ApiService, ServiceSearchFilters } from "../types/service";

function buildServicesPath(filters: ServiceSearchFilters = {}) {
  const params = new URLSearchParams();

  if (filters.category?.trim()) params.set("category", filters.category.trim());
  if (filters.search?.trim()) params.set("search", filters.search.trim());

  const query = params.toString();
  return query ? `/services?${query}` : "/services";
}

export function getServices(filters?: ServiceSearchFilters) {
  return httpGet<ApiService[]>(buildServicesPath(filters));
}

export function getServiceBySlug(slug: string) {
  return httpGet<ApiService>(`/services/${encodeURIComponent(slug)}`);
}
