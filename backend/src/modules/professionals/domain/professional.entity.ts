export type ProfessionalCategorySummary = {
  id: number;
  name: string;
  slug: string;
  iconName: string | null;
};

export type ProfessionalEntity = {
  id: number;
  slug: string;
  displayName: string;
  businessName: string | null;
  bio: string | null;
  location: string | null;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
  verified: boolean;
  homologated: boolean;
  ratingAverage: number;
  ratingsCount: number;
  completedJobsCount: number;
  responseTimeMinutes: number | null;
  trade: string;
  categories: ProfessionalCategorySummary[];
};
