import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AnalyzeServiceRequestUseCase } from "../../application/analyze-service-request.use-case";
import { RefineServiceRequestDescriptionUseCase } from "../../application/refine-service-request-description.use-case";
import { AnalyzeServiceRequestDto } from "../dto/analyze-service-request.dto";
import { RefineServiceRequestDescriptionDto } from "../dto/refine-service-request-description.dto";

@Controller("ai")
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
export class ArtificialIntelligenceRefinementController {
  constructor(private readonly refineServiceRequestDescriptionUseCase: RefineServiceRequestDescriptionUseCase) {}

  @Post("refine-service-request-description")
  @HttpCode(HttpStatus.OK)
  refineServiceRequestDescription(@Body() dto: RefineServiceRequestDescriptionDto) {
    return this.refineServiceRequestDescriptionUseCase.execute(dto);
  }
}
