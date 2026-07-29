import { Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module";
import { CreateReviewUseCase } from "./application/create-review.use-case";
import { GetMyReviewsUseCase } from "./application/get-my-reviews.use-case";
import { GetProfessionalReviewsUseCase } from "./application/get-professional-reviews.use-case";
import { ReplyReviewUseCase } from "./application/reply-review.use-case";
import { REVIEWS_REPOSITORY } from "./domain/reviews.repository";
import { PrismaReviewsRepository } from "./infrastructure/prisma/prisma-reviews.repository";
import { ReviewsController } from "./presentation/http/reviews.controller";

@Module({
  imports: [NotificationsModule],
  controllers: [ReviewsController],
  providers: [
    CreateReviewUseCase,
    GetProfessionalReviewsUseCase,
    GetMyReviewsUseCase,
    ReplyReviewUseCase,
    {
      provide: REVIEWS_REPOSITORY,
      useClass: PrismaReviewsRepository
    }
  ]
})
export class ReviewsModule {}
