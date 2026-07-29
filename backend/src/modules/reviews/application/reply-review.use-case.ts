import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateNotificationService } from "../../notifications/application/create-notification.use-case";
import { ReviewEntity } from "../domain/review.entity";
import { REVIEWS_REPOSITORY, ReviewsRepository } from "../domain/reviews.repository";

@Injectable()
export class ReplyReviewUseCase {
  constructor(
    @Inject(REVIEWS_REPOSITORY)
    private readonly repository: ReviewsRepository,
    private readonly createNotificationService: CreateNotificationService
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

    // Avisamos al cliente que escribió la valoración de que el profesional le respondió.
    try {
      await this.createNotificationService.execute({
        userId: review.authorUserId,
        type: "REVIEW_REPLY",
        title: "Respuesta a tu valoración",
        body: "El profesional respondió a la valoración que dejaste. Entra para leer su respuesta.",
        data: { serviceOrderId: review.serviceOrderId, reviewId: review.id }
      });
    } catch {
      // La notificacion nunca debe interrumpir la respuesta a la valoracion.
    }

    return review;
  }
}
