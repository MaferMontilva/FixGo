import { Module } from "@nestjs/common";
import { PrismaModule } from "../../shared/prisma.module";
import { AnalyzeServiceRequestUseCase } from "./application/analyze-service-request.use-case";
import { RefineServiceRequestDescriptionUseCase } from "./application/refine-service-request-description.use-case";
import { SERVICE_REQUEST_AI_ANALYZER } from "./domain/service-request-ai-analyzer";
import { SERVICE_REQUEST_DESCRIPTION_REFINER } from "./domain/service-request-description-refiner";
import { ProviderSelectingServiceRequestDescriptionRefiner } from "./infrastructure/provider-selecting-service-request-description-refiner";
import { ProviderSelectingServiceRequestAiAnalyzer } from "./infrastructure/provider-selecting-service-request-ai-analyzer";
import {
  ArtificialIntelligenceController,
  ArtificialIntelligenceRefinementController
} from "./presentation/http/artificial-intelligence.controller";

@Module({
  imports: [PrismaModule],
  controllers: [ArtificialIntelligenceController, ArtificialIntelligenceRefinementController],
  providers: [
    AnalyzeServiceRequestUseCase,
    RefineServiceRequestDescriptionUseCase,
    {
      provide: SERVICE_REQUEST_AI_ANALYZER,
      useClass: ProviderSelectingServiceRequestAiAnalyzer
    },
    {
      provide: SERVICE_REQUEST_DESCRIPTION_REFINER,
      useClass: ProviderSelectingServiceRequestDescriptionRefiner
    }
  ]
})
export class ArtificialIntelligenceModule {}
