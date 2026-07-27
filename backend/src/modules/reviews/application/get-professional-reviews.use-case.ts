import { Inject, Injectable } from "@nestjs/common";
import { ReviewEntity } from "../domain/review.entity";
import { REVIEWS_REPOSITORY, ReviewsRepository } from "../domain/reviews.repository";

@Injectable()
export class GetProfessionalReviewsUseCase {
  constructor(
    @Inject(REVIEWS_REPOSITORY)
    private readonly repository: ReviewsRepository
  ) {}

  execute(professionalId: number): Promise<ReviewEntity[]> {
    return this.repository.findReviewsByProfessionalId(professionalId);
  }
}
