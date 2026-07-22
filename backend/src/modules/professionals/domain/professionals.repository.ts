import { ProfessionalEntity } from "./professional.entity";

export const PROFESSIONALS_REPOSITORY = Symbol("PROFESSIONALS_REPOSITORY");

export abstract class ProfessionalsRepository {
  abstract findAllActive(): Promise<ProfessionalEntity[]>;
}
