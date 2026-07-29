import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../shared/prisma.service";
import { AnalyzeServiceRequestInput, ServiceRequestAiAnalysis } from "../domain/service-request-ai-analysis";
import { ServiceRequestAiAnalyzer } from "../domain/service-request-ai-analyzer";
import { GeminiServiceRequestAiAnalyzer } from "./gemini-service-request-ai-analyzer";
import { GroqServiceRequestAiAnalyzer } from "./groq-service-request-ai-analyzer";
import { OpenAiServiceRequestAiAnalyzer } from "./openai-service-request-ai-analyzer";
import { RuleBasedServiceRequestAiAnalyzer } from "./rule-based-service-request-ai-analyzer";

@Injectable()
export class ProviderSelectingServiceRequestAiAnalyzer implements ServiceRequestAiAnalyzer {
  private readonly geminiAnalyzer: GeminiServiceRequestAiAnalyzer;
  private readonly groqAnalyzer: GroqServiceRequestAiAnalyzer;
  private readonly localAnalyzer = new RuleBasedServiceRequestAiAnalyzer();
  private readonly openAiAnalyzer: OpenAiServiceRequestAiAnalyzer;

  constructor(prisma: PrismaService) {
    this.geminiAnalyzer = new GeminiServiceRequestAiAnalyzer(prisma);
    this.groqAnalyzer = new GroqServiceRequestAiAnalyzer(prisma);
    this.openAiAnalyzer = new OpenAiServiceRequestAiAnalyzer(prisma);
  }

  analyze(input: AnalyzeServiceRequestInput): Promise<ServiceRequestAiAnalysis> {
    const provider = process.env.AI_PROVIDER?.trim().toLowerCase();
    this.logProviderSelection(provider);

    if (provider === "gemini") {
      return this.geminiAnalyzer.analyze(input);
    }

    if (provider === "groq") {
      return this.groqAnalyzer.analyze(input);
    }

    if (provider === "openai") {
      return this.openAiAnalyzer.analyze(input);
    }

    if (process.env.GROQ_API_KEY?.trim() && process.env.GROQ_MODEL?.trim()) {
      return this.groqAnalyzer.analyze(input);
    }

    if (process.env.GEMINI_API_KEY?.trim() && process.env.GEMINI_MODEL?.trim()) {
      return this.geminiAnalyzer.analyze(input);
    }

    if (process.env.OPENAI_API_KEY?.trim() && process.env.OPENAI_MODEL?.trim()) {
      return this.openAiAnalyzer.analyze(input);
    }

    return this.localAnalyzer.analyze(input);
  }

  private logProviderSelection(provider: string | undefined) {
    if (process.env.NODE_ENV === "production") return;

    console.info("[FixGo IA] Provider selection", {
      providerRequested: provider || "auto",
      groqConfigured: Boolean(process.env.GROQ_API_KEY?.trim() && process.env.GROQ_MODEL?.trim()),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim() && process.env.GEMINI_MODEL?.trim()),
      openAiConfigured: Boolean(process.env.OPENAI_API_KEY?.trim() && process.env.OPENAI_MODEL?.trim())
    });
  }
}
