import { Controller, Get } from "@nestjs/common";
import { ProfessionalsService } from "../../application/professionals.service";

@Controller("professionals")
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Get()
  findAll() {
    return this.professionalsService.findAll();
  }
}
