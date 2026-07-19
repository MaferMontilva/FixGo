import { ProfessionalEntity } from "./professional.entity";

export abstract class ProfessionalsRepository {
  abstract findAllActive(): Promise<ProfessionalEntity[]>;
}
