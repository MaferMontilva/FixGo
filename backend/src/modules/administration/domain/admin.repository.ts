import { AdminCategory, AdminProfessional, AdminServiceRequest, AdminStats, AdminUser } from "./admin.entities";

export type CreateCategoryData = { code: string; name: string; description?: string | null };
export type UpdateCategoryData = { name?: string; description?: string | null };
export type CreatableRole = "CLIENT" | "PROFESSIONAL" | "ADMIN";
export type CreateUserData = { firstName: string; lastName: string; email: string; password: string; role: CreatableRole };

export const ADMIN_REPOSITORY = Symbol("ADMIN_REPOSITORY");

export abstract class AdminRepository {
  abstract getStats(): Promise<AdminStats>;
  abstract listUsers(): Promise<AdminUser[]>;
  abstract setUserStatus(userId: number, status: string): Promise<AdminUser | null>;
  abstract emailExists(email: string): Promise<boolean>;
  abstract createUser(data: CreateUserData): Promise<AdminUser>;
  abstract setUserAdminRole(userId: number, grant: boolean): Promise<AdminUser | null>;
  abstract listProfessionals(): Promise<AdminProfessional[]>;
  abstract setProfessionalVerification(profileId: number, verificationStatus: string): Promise<AdminProfessional | null>;
  abstract listServiceRequests(): Promise<AdminServiceRequest[]>;
  abstract listCategories(): Promise<AdminCategory[]>;
  abstract setCategoryActive(categoryId: number, isActive: boolean): Promise<AdminCategory | null>;
  abstract categoryCodeExists(code: string): Promise<boolean>;
  abstract createCategory(data: CreateCategoryData): Promise<AdminCategory>;
  abstract updateCategory(categoryId: number, data: UpdateCategoryData): Promise<AdminCategory | null>;
  abstract findCategoryUsage(categoryId: number): Promise<{ services: number; requests: number }>;
  abstract deleteCategory(categoryId: number): Promise<boolean>;
  abstract cancelServiceRequest(requestId: number): Promise<AdminServiceRequest | null>;
  abstract softDeleteServiceRequest(requestId: number): Promise<boolean>;
}
