export type ServiceCategoryEntity = {
  id: number;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
};

export type ServiceEntity = {
  id: number;
  categoryId: number;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  baseUnit: string | null;
  sortOrder: number;
  active: boolean;
  category: ServiceCategoryEntity;
};
