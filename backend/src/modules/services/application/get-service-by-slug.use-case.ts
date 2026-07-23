import { Inject, Injectable } from "@nestjs/common";
import { SERVICES_REPOSITORY, ServicesRepository } from "../domain/services.repository";

@Injectable()
export class GetServiceBySlugUseCase {
  constructor(
    @Inject(SERVICES_REPOSITORY)
    private readonly servicesRepository: ServicesRepository
  ) {}

  execute(slug: string) {
    return this.servicesRepository.findActiveBySlug(slug);
  }
}
