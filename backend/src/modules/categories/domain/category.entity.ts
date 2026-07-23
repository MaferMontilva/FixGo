export type CategoryEntity = {
  id: number;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  iconName: string | null;
  imageUrl: string | null;
  parentId: number | null;
  sortOrder: number;
  active: boolean;
};

export const MARKETPLACE_CATEGORY_CODES = [
  "HANDYMAN",
  "ELECTRICITY",
  "PLUMBING",
  "PAINTING",
  "CLEANING",
  "MOVING",
  "LOCKSMITH",
  "GARDENING"
] as const;
