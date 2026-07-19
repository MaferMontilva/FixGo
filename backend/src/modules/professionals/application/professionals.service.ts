import { Injectable } from "@nestjs/common";
import { ProfessionalEntity } from "../domain/professional.entity";
import { PrismaProfessionalsRepository } from "../infrastructure/prisma/prisma-professionals.repository";

@Injectable()
export class ProfessionalsService {
  constructor(private readonly professionalsRepository: PrismaProfessionalsRepository) {}

  findAll(): Promise<ProfessionalEntity[]> {
    return this.professionalsRepository.findAllActive();
  }
}
