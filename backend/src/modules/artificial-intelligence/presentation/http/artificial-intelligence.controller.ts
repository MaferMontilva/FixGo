import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../auth/presentation/jwt-auth.guard";
import { Roles } from "../../../auth/presentation/roles.decorator";
import { RolesGuard } from "../../../auth/presentation/roles.guard";
import { AnalyzeServiceRequestUseCase } from "../../application/analyze-service-request.use-case";
import { PolishTextUseCase } from "../../application/polish-text.use-case";
import { RefineServiceRequestDescriptionUseCase } from "../../application/refine-service-request-description.use-case";
import { AnalyzeServiceRequestDto } from "../dto/analyze-service-request.dto";
import { PolishTextDto } from "../dto/polish-text.dto";
import { RefineServiceRequestDescriptionDto } from "../dto/refine-service-request-description.dto";

@Controller("ai")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("CLIENT")
export class ArtificialIntelligenceController {
  constructor(
    private readonly analyzeServiceRequestUseCase: AnalyzeServiceRequestUseCase,
    private readonly refineServiceRequestDescriptionUseCase: RefineServiceRequestDescriptionUseCase
  ) {}

  @Post("service-request-analysis")
  @HttpCode(HttpStatus.OK)
  analyzeServiceRequest(@Body() dto: AnalyzeServiceRequestDto) {
    return this.analyzeServiceRequestUseCase.execute(dto);
  }

  @Post("refine-service-request-description")
  @HttpCode(HttpStatus.OK)
  refineServiceRequestDescription(@Body() dto: RefineServiceRequestDescriptionDto) {
    return this.refineServiceRequestDescriptionUseCase.execute(dto);
  }
}

@Controller("artificial-intelligence")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("CLIENT")
export class ArtificialIntelligenceRefinementController {
  constructor(private readonly refineServiceRequestDescriptionUseCase: RefineServiceRequestDescriptionUseCase) {}

  @Post("refine-service-request-description")
  @HttpCode(HttpStatus.OK)
  refineServiceRequestDescription(@Body() dto: RefineServiceRequestDescriptionDto) {
    return this.refineServiceRequestDescriptionUseCase.execute(dto);
  }
}

// Corrector/redactor de texto disponible tanto para clientes como para profesionales.
@Controller("ai")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("CLIENT", "PROFESSIONAL")
export class AiTextAssistantController {
  constructor(private readonly polishTextUseCase: PolishTextUseCase) {}

  @Post("polish-text")
  @HttpCode(HttpStatus.OK)
  polishText(@Body() dto: PolishTextDto) {
    return this.polishTextUseCase.execute(dto);
  }
}
