export type ApiServiceCategory = {
  id: number;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
};

export type ApiService = {
  id: number;
  categoryId: number;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  baseUnit: string | null;
  sortOrder: number;
  active: boolean;
  category: ApiServiceCategory;
};

export type ServiceSearchFilters = {
  category?: string;
  search?: string;
};
