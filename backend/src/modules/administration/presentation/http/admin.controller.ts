import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, RequestUser } from "../../../auth/presentation/current-user";
import { JwtAuthGuard } from "../../../auth/presentation/jwt-auth.guard";
import { Roles } from "../../../auth/presentation/roles.decorator";
import { RolesGuard } from "../../../auth/presentation/roles.guard";
import { AdminService } from "../../application/admin.service";
import { CreateUserDto, SetAdminRoleDto, SetCategoryActiveDto, SetProfessionalVerificationDto, SetUserStatusDto } from "../dto/admin-actions.dto";
import { CreateCategoryDto, UpdateCategoryDto } from "../dto/category.dto";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("stats")
  stats() {
    return this.adminService.getStats();
  }

  @Get("users")
  users() {
    return this.adminService.listUsers();
  }

  @Patch("users/:id/status")
  setUserStatus(@CurrentUser() actor: RequestUser, @Param("id", ParseIntPipe) id: number, @Body() dto: SetUserStatusDto) {
    return this.adminService.setUserStatus(actor.id, id, dto.status);
  }

  @Post("users")
  createUser(@CurrentUser() actor: RequestUser, @Body() dto: CreateUserDto) {
    return this.adminService.createUser(actor.id, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: dto.password,
      role: dto.role as "CLIENT" | "PROFESSIONAL" | "ADMIN"
    });
  }

  @Patch("users/:id/admin-role")
  setUserAdminRole(@CurrentUser() actor: RequestUser, @Param("id", ParseIntPipe) id: number, @Body() dto: SetAdminRoleDto) {
    return this.adminService.setUserAdminRole(actor.id, id, dto.grant);
  }

  @Get("professionals")
  professionals() {
    return this.adminService.listProfessionals();
  }

  @Patch("professionals/:id/verification")
  setProfessionalVerification(@Param("id", ParseIntPipe) id: number, @Body() dto: SetProfessionalVerificationDto) {
    return this.adminService.setProfessionalVerification(id, dto.verificationStatus);
  }

  @Get("service-requests")
  serviceRequests() {
    return this.adminService.listServiceRequests();
  }

  @Patch("service-requests/:id/cancel")
  cancelServiceRequest(@Param("id", ParseIntPipe) id: number) {
    return this.adminService.cancelServiceRequest(id);
  }

  @Delete("service-requests/:id")
  deleteServiceRequest(@Param("id", ParseIntPipe) id: number) {
    return this.adminService.deleteServiceRequest(id);
  }

  @Get("categories")
  categories() {
    return this.adminService.listCategories();
  }

  @Patch("categories/:id/active")
  setCategoryActive(@Param("id", ParseIntPipe) id: number, @Body() dto: SetCategoryActiveDto) {
    return this.adminService.setCategoryActive(id, dto.isActive);
  }

  @Post("categories")
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.adminService.createCategory(dto);
  }

  @Patch("categories/:id")
  updateCategory(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.adminService.updateCategory(id, dto);
  }

  @Delete("categories/:id")
  deleteCategory(@Param("id", ParseIntPipe) id: number) {
    return this.adminService.deleteCategory(id);
  }
}
