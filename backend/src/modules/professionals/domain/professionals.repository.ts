import { ProfessionalEntity, ProfessionalMeEntity, ProfessionalOpportunityEntity, UpsertProfessionalProfileData } from "./professional.entity";

export const PROFESSIONALS_REPOSITORY = Symbol("PROFESSIONALS_REPOSITORY");

export abstract class ProfessionalsRepository {
  abstract findAllActive(): Promise<ProfessionalEntity[]>;
  abstract countCompatibleProfessionals(categoryId: number, location: string | null): Promise<number>;
  abstract findMeByUserId(userId: number): Promise<ProfessionalMeEntity | null>;
  abstract upsertMe(userId: number, data: UpsertProfessionalProfileData): Promise<ProfessionalMeEntity>;
  abstract findCompatibleOpportunities(userId: number): Promise<ProfessionalOpportunityEntity[]>;
  abstract findCompatibleOpportunityById(userId: number, opportunityId: number): Promise<ProfessionalOpportunityEntity | null>;
  abstract dismissOpportunity(userId: number, opportunityId: number, reason: string): Promise<void>;
}
