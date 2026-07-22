import { Inject, Injectable } from "@nestjs/common";
import { ProfessionalEntity } from "../domain/professional.entity";
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
}
