import { Inject, Injectable } from "@nestjs/common";
import {
  ListServicesFilters,
  SERVICES_REPOSITORY,
  ServicesRepository
} from "../domain/services.repository";

@Injectable()
export class ListServicesUseCase {
  constructor(
    @Inject(SERVICES_REPOSITORY)
    private readonly servicesRepository: ServicesRepository
  ) {}

  execute(filters: ListServicesFilters) {
    return this.servicesRepository.findActive(filters);
  }
}
