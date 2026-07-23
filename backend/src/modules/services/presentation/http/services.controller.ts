import { Controller, Get, NotFoundException, Param, Query } from "@nestjs/common";
import { GetServiceBySlugUseCase } from "../../application/get-service-by-slug.use-case";
import { ListServicesUseCase } from "../../application/list-services.use-case";

@Controller("services")
export class ServicesController {
  constructor(
    private readonly listServicesUseCase: ListServicesUseCase,
    private readonly getServiceBySlugUseCase: GetServiceBySlugUseCase
  ) {}

  @Get()
  findAll(@Query("category") category?: string, @Query("search") search?: string) {
    return this.listServicesUseCase.execute({ category, search });
  }

  @Get(":slug")
  async findBySlug(@Param("slug") slug: string) {
    const service = await this.getServiceBySlugUseCase.execute(slug);

    if (!service) {
      throw new NotFoundException("Servicio no encontrado.");
    }

    return service;
  }
}
