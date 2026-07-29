import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { ReviewEntity } from "../domain/review.entity";
import { REVIEWS_REPOSITORY, ReviewsRepository } from "../domain/reviews.repository";

@Injectable()
export class GetMyReviewsUseCase {
  constructor(
    @Inject(REVIEWS_REPOSITORY)
    private readonly repository: ReviewsRepository
  ) {}

  async execute(professionalUserId: number): Promise<ReviewEntity[]> {
    const professionalId = await this.repository.findProfessionalIdByUserId(professionalUserId);
    if (!professionalId) {
      throw new ForbiddenException("Completa tu perfil profesional.");
    }
    return this.repository.findReviewsByProfessionalId(professionalId);
  }
}
