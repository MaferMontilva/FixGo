export type AdminStats = {
  totalUsers: number;
  clients: number;
  professionals: number;
  activeProfessionals: number;
  publishedRequests: number;
  serviceOrders: number;
  reviews: number;
};
export type AdminUser = {
  id: number;
  email: string | null;
  firstName: string;
  lastName: string;
  status: string;
  roles: string[];
  createdAt: string;
};
export type AdminProfessional = {
  id: number;
  userId: number;
  displayName: string;
  businessName: string | null;
  email: string | null;
  verificationStatus: string;
  profileStatus: string;
  isVerified: boolean;
  ratingAverage: number;
  ratingsCount: number;
  createdAt: string;
};
export type AdminServiceRequest = {
  id: number;
  title: string | null;
  clientName: string;
  categoryName: string | null;
  status: string;
  urgency: string;
  createdAt: string;
};
export type AdminCategory = {
  id: number;
  code: string;
  name: string;
  slug: string;
  isActive: boolean;
  servicesCount: number;
};
