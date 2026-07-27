import { AdminCategory, AdminProfessional, AdminServiceRequest, AdminStats, AdminUser } from "./admin.entities";

export const ADMIN_REPOSITORY = Symbol("ADMIN_REPOSITORY");

export abstract class AdminRepository {
  abstract getStats(): Promise<AdminStats>;
  abstract listUsers(): Promise<AdminUser[]>;
  abstract setUserStatus(userId: number, status: string): Promise<AdminUser | null>;
  abstract listProfessionals(): Promise<AdminProfessional[]>;
  abstract setProfessionalVerification(profileId: number, verificationStatus: string): Promise<AdminProfessional | null>;
  abstract listServiceRequests(): Promise<AdminServiceRequest[]>;
  abstract listCategories(): Promise<AdminCategory[]>;
  abstract setCategoryActive(categoryId: number, isActive: boolean): Promise<AdminCategory | null>;
}
