import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ReviewEntity } from "../domain/review.entity";
import { REVIEWS_REPOSITORY, ReviewsRepository } from "../domain/reviews.repository";

@Injectable()
export class ReplyReviewUseCase {
  constructor(
    @Inject(REVIEWS_REPOSITORY)
    private readonly repository: ReviewsRepository
  ) {}

  async execute(reviewId: number, professionalUserId: number, reply: string): Promise<ReviewEntity> {
    const professionalId = await this.repository.findProfessionalIdByUserId(professionalUserId);

    if (!professionalId) {
      throw new ForbiddenException("Completa tu perfil profesional.");
    }

    const review = await this.repository.replyToReview(reviewId, professionalId, reply.trim());

    if (!review) {
      throw new NotFoundException("No encontramos una valoracion tuya con ese identificador.");
    }

    return review;
  }
}
