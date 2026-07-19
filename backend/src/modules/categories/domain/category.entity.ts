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
