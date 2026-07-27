import { Inject, Injectable } from "@nestjs/common";
import { AnalyzeServiceRequestInput, ServiceRequestAiAnalysis } from "../domain/service-request-ai-analysis";
import { SERVICE_REQUEST_AI_ANALYZER, ServiceRequestAiAnalyzer } from "../domain/service-request-ai-analyzer";

@Injectable()
export class AnalyzeServiceRequestUseCase {
  constructor(
    @Inject(SERVICE_REQUEST_AI_ANALYZER)
    private readonly analyzer: ServiceRequestAiAnalyzer
  ) {}

  execute(input: AnalyzeServiceRequestInput): Promise<ServiceRequestAiAnalysis> {
    return this.analyzer.analyze(input);
  }
}
