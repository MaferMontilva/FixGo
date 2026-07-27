export type ProfessionalProfileStatus = "incomplete" | "complete" | "review" | "active";

export type ProfessionalOnboardingProfile = {
  availability: string;
  categories: string[];
  categoryIds: number[];
  city: string;
  document: string;
  email: string;
  experienceYears: string;
  fullName: string;
  phone: string;
  photoDataUrl: string;
  postalCode: string;
  profileStatus: ProfessionalProfileStatus;
  province: string;
  referenceAddress: string;
  shortBio: string;
  serviceIds: number[];
  termsAccepted: boolean;
  workRadius: string;
};

export type ProfessionalCategory = {
  id: number;
  name: string;
  slug: string;
  iconName: string | null;
};

export type ProfessionalService = {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
};

export type ProfessionalProfileApi = {
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
  categories: ProfessionalCategory[];
  services: ProfessionalService[];
};

export type UpdateProfessionalProfilePayload = {
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

export type ProfessionalOpportunity = {
  id: number;
  title: string | null;
  description: string;
  category: ProfessionalCategory | null;
  service: ProfessionalService | null;
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
