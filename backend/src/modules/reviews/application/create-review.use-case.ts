import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateNotificationService } from "../../notifications/application/create-notification.use-case";
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
    private readonly repository: ReviewsRepository,
    private readonly createNotificationService: CreateNotificationService
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

    const review = await this.repository.createReview({
      serviceOrderId: command.serviceOrderId,
      authorUserId: command.authorUserId,
      professionalId: order.professionalId,
      rating: command.rating,
      title: command.title?.trim() || null,
      comment: command.comment?.trim() || null
    });

    await this.notifyProfessional(order.professionalId, review);

    return review;
  }

  private async notifyProfessional(professionalId: number, review: ReviewEntity): Promise<void> {
    try {
      const professionalUserId = await this.repository.findProfessionalUserId(professionalId);
      if (!professionalUserId) return;
      await this.createNotificationService.execute({
        userId: professionalUserId,
        type: "REVIEW_RECEIVED",
        title: "Nueva valoración",
        body: `Un cliente valoró tu trabajo con ${review.rating} de 5 estrellas.`,
        data: { serviceOrderId: review.serviceOrderId, reviewId: review.id }
      });
    } catch {
      // La notificacion nunca debe interrumpir el registro de la valoracion.
    }
  }
}
