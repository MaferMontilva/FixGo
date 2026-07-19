import { Body, Controller, Get, Post } from "@nestjs/common";
import { ServiceRequestsService } from "../../application/service-requests.service";
import { CreateServiceRequestDto } from "../dto/create-service-request.dto";

@Controller("service-requests")
export class ServiceRequestsController {
  constructor(private readonly serviceRequestsService: ServiceRequestsService) {}

  @Get()
  findAll() {
    return this.serviceRequestsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateServiceRequestDto) {
    return this.serviceRequestsService.create(dto);
  }
}
