export type UiProfessional = {
  id?: number;
  name: string;
  trade: string;
  location: string;
  verified: boolean;
  homologated?: boolean;
  ratingAverage?: number;
  completedJobsCount?: number;
};

export type ApiProfessional = {
  id: number;
  displayName: string;
  businessName: string | null;
  location: string | null;
  verified: boolean;
  homologated: boolean;
  ratingAverage: number;
  completedJobsCount: number;
  trade: string;
};
