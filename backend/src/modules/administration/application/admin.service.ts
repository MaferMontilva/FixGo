import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ADMIN_REPOSITORY, AdminRepository, CreateCategoryData, CreateUserData, UpdateCategoryData } from "../domain/admin.repository";

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/;

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

  async setUserStatus(actingUserId: number, userId: number, status: string) {
    if (!USER_STATUSES.includes(status)) {
      throw new BadRequestException("Estado de usuario no valido.");
    }

    const users = await this.repository.listUsers();
    const actor = users.find((user) => user.id === actingUserId);
    const target = users.find((user) => user.id === userId);
    if (!target) throw new NotFoundException("Usuario no encontrado.");

    // Un administrador no puede cambiar el estado de su propia cuenta (evita autobloqueo).
    if (userId === actingUserId) {
      throw new BadRequestException("No puedes cambiar el estado de tu propia cuenta.");
    }

    const actorIsMaster = actor?.roles.includes("SUPER_ADMIN") ?? false;
    const targetIsMaster = target.roles.includes("SUPER_ADMIN");
    const targetIsAdmin = target.roles.includes("ADMIN");

    // Jerarquia de administradores:
    // - Un administrador master esta protegido: nadie puede suspenderlo desde el panel.
    // - A un administrador normal solo lo puede gestionar un master.
    if (targetIsMaster) {
      throw new ForbiddenException("No se puede suspender a un administrador master.");
    }
    if (targetIsAdmin && !actorIsMaster) {
      throw new ForbiddenException("Solo un administrador master puede gestionar a otros administradores.");
    }

    const user = await this.repository.setUserStatus(userId, status);
    if (!user) throw new NotFoundException("Usuario no encontrado.");
    return user;
  }

  async createUser(actingUserId: number, data: CreateUserData) {
    const users = await this.repository.listUsers();
    const actor = users.find((user) => user.id === actingUserId);

    if (!["CLIENT", "PROFESSIONAL", "ADMIN"].includes(data.role)) {
      throw new BadRequestException("Rol no valido.");
    }
    // Crear un administrador solo lo permite un administrador master.
    if (data.role === "ADMIN" && !actor?.roles.includes("SUPER_ADMIN")) {
      throw new ForbiddenException("Solo un administrador master puede crear administradores.");
    }

    const firstName = data.firstName.trim();
    const lastName = data.lastName.trim();
    const email = data.email.trim().toLowerCase();

    if (firstName.length < 2 || firstName.length > 80 || !NAME_REGEX.test(firstName)) {
      throw new BadRequestException("El nombre solo puede contener letras (2 a 80 caracteres).");
    }
    if (lastName.length < 2 || lastName.length > 80 || !NAME_REGEX.test(lastName)) {
      throw new BadRequestException("El apellido solo puede contener letras (2 a 80 caracteres).");
    }
    if (!EMAIL_REGEX.test(email)) {
      throw new BadRequestException("Escribe un correo electronico valido.");
    }
    if (data.password.length < 8 || !PASSWORD_REGEX.test(data.password)) {
      throw new BadRequestException("La clave temporal debe tener al menos 8 caracteres, con letra y numero.");
    }
    if (await this.repository.emailExists(email)) {
      throw new ConflictException("Ese correo ya tiene una cuenta.");
    }

    return this.repository.createUser({ firstName, lastName, email, password: data.password, role: data.role });
  }

  async setUserAdminRole(actingUserId: number, userId: number, grant: boolean) {
    const users = await this.repository.listUsers();
    const actor = users.find((user) => user.id === actingUserId);
    const target = users.find((user) => user.id === userId);
    if (!target) throw new NotFoundException("Usuario no encontrado.");

    if (!actor?.roles.includes("SUPER_ADMIN")) {
      throw new ForbiddenException("Solo un administrador master puede otorgar o quitar permisos de administrador.");
    }
    if (userId === actingUserId) {
      throw new BadRequestException("No puedes cambiar tus propios permisos.");
    }
    if (target.roles.includes("SUPER_ADMIN")) {
      throw new ForbiddenException("No se pueden modificar los permisos de un administrador master.");
    }

    const updated = await this.repository.setUserAdminRole(userId, grant);
    if (!updated) throw new NotFoundException("Usuario no encontrado.");
    return updated;
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
