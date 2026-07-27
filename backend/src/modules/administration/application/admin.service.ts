import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ADMIN_REPOSITORY, AdminRepository, CreateCategoryData, UpdateCategoryData } from "../domain/admin.repository";

const USER_STATUSES = ["ACTIVE", "SUSPENDED", "BLOCKED"];
const VERIFICATION_STATUSES = ["PENDING", "IN_REVIEW", "APPROVED", "REJECTED", "SUSPENDED"];

@Injectable()
export class AdminService {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly repository: AdminRepository
  ) {}

  getStats() {
    return this.repository.getStats();
  }

  listUsers() {
    return this.repository.listUsers();
  }

  async setUserStatus(userId: number, status: string) {
    if (!USER_STATUSES.includes(status)) {
      throw new BadRequestException("Estado de usuario no valido.");
    }
    const user = await this.repository.setUserStatus(userId, status);
    if (!user) throw new NotFoundException("Usuario no encontrado.");
    return user;
  }

  listProfessionals() {
    return this.repository.listProfessionals();
  }

  async setProfessionalVerification(profileId: number, verificationStatus: string) {
    if (!VERIFICATION_STATUSES.includes(verificationStatus)) {
      throw new BadRequestException("Estado de verificacion no valido.");
    }
    const professional = await this.repository.setProfessionalVerification(profileId, verificationStatus);
    if (!professional) throw new NotFoundException("Profesional no encontrado.");
    return professional;
  }

  listServiceRequests() {
    return this.repository.listServiceRequests();
  }

  listCategories() {
    return this.repository.listCategories();
  }

  async setCategoryActive(categoryId: number, isActive: boolean) {
    const category = await this.repository.setCategoryActive(categoryId, isActive);
    if (!category) throw new NotFoundException("Categoria no encontrada.");
    return category;
  }

  async createCategory(data: CreateCategoryData) {
    const code = data.code.trim().toUpperCase();
    if (!/^[A-Z0-9_]{2,40}$/.test(code)) {
      throw new BadRequestException("El codigo debe ser mayusculas, numeros o guion bajo (2-40).");
    }
    if (await this.repository.categoryCodeExists(code)) {
      throw new ConflictException("Ya existe una categoria con ese codigo.");
    }
    return this.repository.createCategory({ code, name: data.name.trim(), description: data.description?.trim() || null });
  }

  async updateCategory(categoryId: number, data: UpdateCategoryData) {
    const category = await this.repository.updateCategory(categoryId, {
      name: data.name?.trim(),
      description: data.description?.trim() || null
    });
    if (!category) throw new NotFoundException("Categoria no encontrada.");
    return category;
  }

  async deleteCategory(categoryId: number) {
    const usage = await this.repository.findCategoryUsage(categoryId);
    if (usage.services > 0 || usage.requests > 0) {
      throw new ConflictException("No se puede eliminar: la categoria tiene servicios o solicitudes asociadas. Desactivala en su lugar.");
    }
    const deleted = await this.repository.deleteCategory(categoryId);
    if (!deleted) throw new NotFoundException("Categoria no encontrada.");
    return { deleted: true };
  }

  async cancelServiceRequest(requestId: number) {
    const request = await this.repository.cancelServiceRequest(requestId);
    if (!request) throw new NotFoundException("Solicitud no encontrada.");
    return request;
  }

  async deleteServiceRequest(requestId: number) {
    const deleted = await this.repository.softDeleteServiceRequest(requestId);
    if (!deleted) throw new NotFoundException("Solicitud no encontrada.");
    return { deleted: true };
  }
}
