import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, RequestUser } from "../../../auth/presentation/current-user";
import { JwtAuthGuard } from "../../../auth/presentation/jwt-auth.guard";
import { Roles } from "../../../auth/presentation/roles.decorator";
import { RolesGuard } from "../../../auth/presentation/roles.guard";
import { CreateReviewUseCase } from "../../application/create-review.use-case";
import { GetProfessionalReviewsUseCase } from "../../application/get-professional-reviews.use-case";
import { ReplyReviewUseCase } from "../../application/reply-review.use-case";
import { ReviewEntity } from "../../domain/review.entity";
import { CreateReviewDto } from "../dto/create-review.dto";
import { ReplyReviewDto } from "../dto/reply-review.dto";

@Controller("reviews")
export class ReviewsController {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly getProfessionalReviewsUseCase: GetProfessionalReviewsUseCase,
    private readonly replyReviewUseCase: ReplyReviewUseCase
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CLIENT")
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: RequestUser, @Body() dto: CreateReviewDto) {
    return this.toResponse(await this.createReviewUseCase.execute({ ...dto, authorUserId: user.id }));
  }

  @Get("professional/:id")
  async byProfessional(@Param("id", ParseIntPipe) id: number) {
    const reviews = await this.getProfessionalReviewsUseCase.execute(id);
    return reviews.map((review) => this.toResponse(review));
  }

  @Post(":id/reply")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("PROFESSIONAL")
  @HttpCode(HttpStatus.OK)
  async reply(@CurrentUser() user: RequestUser, @Param("id", ParseIntPipe) id: number, @Body() dto: ReplyReviewDto) {
    return this.toResponse(await this.replyReviewUseCase.execute(id, user.id, dto.reply));
  }

  private toResponse(review: ReviewEntity) {
    return {
      id: review.id,
      serviceOrderId: review.serviceOrderId,
      professionalId: review.professionalId,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      professionalReply: review.professionalReply,
      professionalRepliedAt: review.professionalRepliedAt,
      createdAt: review.createdAt,
      authorName: review.authorName
    };
  }
}
