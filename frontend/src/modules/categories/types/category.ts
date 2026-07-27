import type { LucideIcon } from "lucide-react";

export type UiCategory = {
  id: number;
  code: string;
  name: string;
  slug: string;
  description?: string | null;
  iconName?: string | null;
  icon: LucideIcon;
  sortOrder: number;
  active: boolean;
};

export type ApiCategory = {
  id: number;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  iconName: string | null;
  sortOrder: number;
  active: boolean;
};
