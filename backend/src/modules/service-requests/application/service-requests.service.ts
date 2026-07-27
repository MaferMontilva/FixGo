import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ServiceRequestEntity } from "../domain/service-request.entity";
import {
  SERVICE_REQUESTS_REPOSITORY,
  ServiceRequestsRepository
} from "../domain/service-requests.repository";
import { CreateServiceRequestCommand } from "./create-service-request.command";

@Injectable()
export class ServiceRequestsService {
  constructor(
    @Inject(SERVICE_REQUESTS_REPOSITORY)
    private readonly serviceRequestsRepository: ServiceRequestsRepository
  ) {}

  findAll(): Promise<ServiceRequestEntity[]> {
    return this.serviceRequestsRepository.findRecent();
  }

  create(command: CreateServiceRequestCommand) {
    if (!command.clientUserId) {
      throw new BadRequestException("clientUserId es obligatorio.");
    }

    if (!command.originalDescription?.trim()) {
      throw new BadRequestException("originalDescription es obligatorio.");
    }

    if (
      typeof command.budgetMin === "number" &&
      typeof command.budgetMax === "number" &&
      command.budgetMax < command.budgetMin
    ) {
      throw new BadRequestException("budgetMax no puede ser menor que budgetMin.");
    }

    return this.serviceRequestsRepository.create(command);
  }
}
