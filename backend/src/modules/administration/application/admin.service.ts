import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ADMIN_REPOSITORY, AdminRepository } from "../domain/admin.repository";

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
}
