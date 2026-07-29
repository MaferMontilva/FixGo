import { Controller, Get, NotFoundException, Param, Query } from "@nestjs/common";
import { CategoriesService } from "../../application/categories.service";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Query("scope") scope?: string) {
    if (scope === "marketplace") {
      return this.categoriesService.findMarketplace();
    }

    return this.categoriesService.findAll();
  }

  @Get(":slug")
  async findBySlug(@Param("slug") slug: string) {
    const category = await this.categoriesService.findBySlug(slug);

    if (!category) {
      throw new NotFoundException("Categoría no encontrada.");
    }

    return category;
  }
}
