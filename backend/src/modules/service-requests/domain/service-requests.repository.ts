import { CreateServiceRequestCommand } from "../application/create-service-request.command";
import { ServiceRequestEntity } from "./service-request.entity";

export abstract class ServiceRequestsRepository {
  abstract findRecent(): Promise<ServiceRequestEntity[]>;
  abstract create(command: CreateServiceRequestCommand): Promise<unknown>;
}
