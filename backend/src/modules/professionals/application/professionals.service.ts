import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ProfessionalEntity, UpsertProfessionalProfileData } from "../domain/professional.entity";
import { PROFESSIONALS_REPOSITORY, ProfessionalsRepository } from "../domain/professionals.repository";

@Injectable()
export class ProfessionalsService {
  constructor(
    @Inject(PROFESSIONALS_REPOSITORY)
    private readonly professionalsRepository: ProfessionalsRepository
  ) {}

  findAll(): Promise<ProfessionalEntity[]> {
    return this.professionalsRepository.findAllActive();
  }

  async countCompatible(categoryId: number, location: string | null): Promise<{ count: number }> {
    if (!Number.isInteger(categoryId) || categoryId <= 0) return { count: 0 };
    const count = await this.professionalsRepository.countCompatibleProfessionals(categoryId, location);
    return { count };
  }

  findMe(userId: number) {
    return this.professionalsRepository.findMeByUserId(userId);
  }

  saveMe(userId: number, data: UpsertProfessionalProfileData) {
    if (!data.displayName?.trim()) {
      throw new BadRequestException("El nombre profesional es obligatorio.");
    }

    if (!data.categoryIds.length) {
      throw new BadRequestException("Selecciona al menos una categoría.");
    }

    if (!/^(0[1-9]|[1-4]\d|5[0-2])\d{3}$/.test(data.postalCode)) {
      throw new BadRequestException("El código postal debe ser español y tener 5 dígitos.");
    }

    return this.professionalsRepository.upsertMe(userId, data);
  }

  findOpportunities(userId: number) {
    return this.professionalsRepository.findCompatibleOpportunities(userId);
  }

  async findOpportunity(userId: number, opportunityId: number) {
    const opportunity = await this.professionalsRepository.findCompatibleOpportunityById(userId, opportunityId);

    if (!opportunity) {
      throw new NotFoundException("Oportunidad no encontrada.");
    }

    return opportunity;
  }

  async dismissOpportunity(userId: number, opportunityId: number, reason: string) {
    await this.professionalsRepository.dismissOpportunity(userId, opportunityId, reason);
    return { dismissed: true };
  }
}
