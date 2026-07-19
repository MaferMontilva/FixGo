import { Controller, Get } from "@nestjs/common";
import { CategoriesService } from "../../application/categories.service";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }
}
