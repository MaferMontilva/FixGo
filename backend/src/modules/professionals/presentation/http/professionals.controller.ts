import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, ParseIntPipe, Query, UseGuards } from "@nestjs/common";
import { CurrentUser, RequestUser } from "../../../auth/presentation/current-user";
import { JwtAuthGuard } from "../../../auth/presentation/jwt-auth.guard";
import { Roles } from "../../../auth/presentation/roles.decorator";
import { RolesGuard } from "../../../auth/presentation/roles.guard";
import { ProfessionalsService } from "../../application/professionals.service";
import { UpdateProfessionalProfileDto } from "../dto/update-professional-profile.dto";
import { DismissOpportunityDto } from "../dto/dismiss-opportunity.dto";

@Controller("professionals")
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Get("me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("PROFESSIONAL")
  findMe(@CurrentUser() user: RequestUser) {
    return this.professionalsService.findMe(user.id);
  }

  @Patch("me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("PROFESSIONAL")
  updateMe(@CurrentUser() user: RequestUser, @Body() dto: UpdateProfessionalProfileDto) {
    return this.professionalsService.saveMe(user.id, dto);
  }

  @Get("me/opportunities")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("PROFESSIONAL")
  findOpportunities(@CurrentUser() user: RequestUser) {
    return this.professionalsService.findOpportunities(user.id);
  }

  @Get("me/opportunities/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("PROFESSIONAL")
  findOpportunity(@CurrentUser() user: RequestUser, @Param("id", ParseIntPipe) id: number) {
    return this.professionalsService.findOpportunity(user.id, id);
  }

  @Post("me/opportunities/:id/dismiss")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("PROFESSIONAL")
  dismissOpportunity(
    @CurrentUser() user: RequestUser,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: DismissOpportunityDto
  ) {
    return this.professionalsService.dismissOpportunity(user.id, id, dto.reason);
  }

  @Get("compatible-count")
  countCompatible(@Query("categoryId") categoryId?: string, @Query("location") location?: string) {
    return this.professionalsService.countCompatible(Number(categoryId), location ?? null);
  }

  @Get()
  findAll() {
    return this.professionalsService.findAll();
  }
}
