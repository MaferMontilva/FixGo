import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ReviewEntity } from "../domain/review.entity";
import { REVIEWS_REPOSITORY, ReviewsRepository } from "../domain/reviews.repository";

export type CreateReviewCommand = {
  authorUserId: number;
  serviceOrderId: number;
  rating: number;
  title?: string | null;
  comment?: string | null;
};

@Injectable()
export class CreateReviewUseCase {
  constructor(
    @Inject(REVIEWS_REPOSITORY)
    private readonly repository: ReviewsRepository
  ) {}

  async execute(command: CreateReviewCommand): Promise<ReviewEntity> {
    const order = await this.repository.findServiceOrderForReview(command.serviceOrderId);

    if (!order) {
      throw new NotFoundException("El trabajo no existe.");
    }

    if (order.clientUserId !== command.authorUserId) {
      throw new ForbiddenException("Solo puedes valorar tus propios trabajos.");
    }

    if (order.status !== "COMPLETED") {
      throw new ConflictException("Solo puedes valorar trabajos completados y confirmados.");
    }

    const existing = await this.repository.findExistingReview(command.serviceOrderId, command.authorUserId);

    if (existing) {
      throw new ConflictException("Ya has valorado este trabajo.");
    }

    return this.repository.createReview({
      serviceOrderId: command.serviceOrderId,
      authorUserId: command.authorUserId,
      professionalId: order.professionalId,
      rating: command.rating,
      title: command.title?.trim() || null,
      comment: command.comment?.trim() || null
    });
  }
}
