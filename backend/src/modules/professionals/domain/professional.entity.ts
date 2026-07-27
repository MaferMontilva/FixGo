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

export type ProfessionalServiceSummary = {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
};

export type ProfessionalMeEntity = {
  id: number;
  userId: number;
  displayName: string;
  businessName: string | null;
  email: string | null;
  phone: string | null;
  document: string | null;
  bio: string | null;
  yearsExperience: number;
  province: string | null;
  municipality: string | null;
  postalCode: string | null;
  referenceAddress: string | null;
  workRadius: number | null;
  availability: string | null;
  status: string;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  categories: ProfessionalCategorySummary[];
  services: ProfessionalServiceSummary[];
};

export type UpsertProfessionalProfileData = {
  displayName: string;
  email?: string | null;
  businessName?: string | null;
  phone?: string | null;
  document?: string | null;
  bio?: string | null;
  yearsExperience?: number;
  province: string;
  municipality: string;
  postalCode: string;
  referenceAddress?: string | null;
  workRadius: number;
  availability?: string | null;
  profileImageUrl?: string | null;
  categoryIds: number[];
  serviceIds: number[];
};

export type ProfessionalOpportunityEntity = {
  id: number;
  title: string | null;
  description: string;
  category: ProfessionalCategorySummary | null;
  service: ProfessionalServiceSummary | null;
  location: string | null;
  province: string | null;
  municipality: string | null;
  urgency: string;
  budgetMin: number | null;
  budgetMax: number | null;
  preferredDateFrom: string | null;
  preferredDateTo: string | null;
  flexibleSchedule: boolean;
  publishedAt: string | null;
  createdAt: string;
};
