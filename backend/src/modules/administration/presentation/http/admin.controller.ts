import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../auth/presentation/jwt-auth.guard";
import { Roles } from "../../../auth/presentation/roles.decorator";
import { RolesGuard } from "../../../auth/presentation/roles.guard";
import { AdminService } from "../../application/admin.service";
import { SetCategoryActiveDto, SetProfessionalVerificationDto, SetUserStatusDto } from "../dto/admin-actions.dto";
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
  setUserStatus(@Param("id", ParseIntPipe) id: number, @Body() dto: SetUserStatusDto) {
    return this.adminService.setUserStatus(id, dto.status);
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
