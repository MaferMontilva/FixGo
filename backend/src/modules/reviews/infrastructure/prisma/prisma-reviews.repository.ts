import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma.service";
import { ReviewEntity } from "../../domain/review.entity";
import { CreateReviewData, ReviewsRepository, ServiceOrderForReview } from "../../domain/reviews.repository";

type ReviewRecord = {
  id: number;
  serviceOrderId: number;
  authorUserId: number;
  professionalId: number;
  rating: number;
  title: string | null;
  comment: string | null;
  professionalReply: string | null;
  professionalRepliedAt: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class PrismaReviewsRepository implements ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findProfessionalIdByUserId(userId: number): Promise<number | null> {
    const profile = await this.prisma.professionalProfiles.findUnique({ where: { userId }, select: { id: true } });
    return profile?.id ?? null;
  }

  async findProfessionalUserId(professionalId: number): Promise<number | null> {
    const profile = await this.prisma.professionalProfiles.findUnique({ where: { id: professionalId }, select: { userId: true } });
    return profile?.userId ?? null;
  }

  async findServiceOrderForReview(serviceOrderId: number): Promise<ServiceOrderForReview | null> {
    const order = await this.prisma.serviceOrders.findUnique({
      where: { id: serviceOrderId },
      select: { id: true, clientUserId: true, professionalId: true, status: true }
    });
    return order ?? null;
  }

  async findExistingReview(serviceOrderId: number, authorUserId: number): Promise<ReviewEntity | null> {
    const review = await this.prisma.reviews.findUnique({
      where: { serviceOrderId_authorUserId: { serviceOrderId, authorUserId } }
    });
    if (!review) return null;
    const [hydrated] = await this.hydrate([review as ReviewRecord]);
    return hydrated;
  }

  async createReview(data: CreateReviewData): Promise<ReviewEntity> {
    const now = new Date().toISOString();

    const reviewId = await this.prisma.$transaction(async (tx) => {
      const created = await tx.reviews.create({
        data: {
          serviceOrderId: data.serviceOrderId,
          authorUserId: data.authorUserId,
          professionalId: data.professionalId,
          rating: data.rating,
          title: data.title ?? null,
          comment: data.comment ?? null,
          status: "PUBLISHED",
          createdAt: now,
          updatedAt: now
        }
      });

      const stats = await tx.reviews.aggregate({
        where: { professionalId: data.professionalId, status: "PUBLISHED" },
        _avg: { rating: true },
        _count: { _all: true }
      });

      await tx.professionalProfiles.update({
        where: { id: data.professionalId },
        data: {
          ratingAverage: Math.round((stats._avg.rating ?? 0) * 100) / 100,
          ratingsCount: stats._count._all,
          updatedAt: now
        }
      });

      return created.id;
    });

    const review = await this.prisma.reviews.findUnique({ where: { id: reviewId } });
    const [hydrated] = await this.hydrate([review as ReviewRecord]);
    return hydrated;
  }

  async findReviewsByProfessionalId(professionalId: number): Promise<ReviewEntity[]> {
    const reviews = await this.prisma.reviews.findMany({
      where: { professionalId, status: "PUBLISHED" },
      orderBy: [{ createdAt: "desc" }]
    });
    return this.hydrate(reviews as ReviewRecord[]);
  }

  async replyToReview(reviewId: number, professionalId: number, reply: string): Promise<ReviewEntity | null> {
    const review = await this.prisma.reviews.findFirst({ where: { id: reviewId, professionalId } });
    if (!review) return null;

    const now = new Date().toISOString();
    await this.prisma.reviews.update({
      where: { id: reviewId },
      data: { professionalReply: reply, professionalRepliedAt: now, updatedAt: now }
    });

    const updated = await this.prisma.reviews.findUnique({ where: { id: reviewId } });
    const [hydrated] = await this.hydrate([updated as ReviewRecord]);
    return hydrated;
  }

  private async hydrate(reviews: ReviewRecord[]): Promise<ReviewEntity[]> {
    if (reviews.length === 0) return [];
    const authorIds = [...new Set(reviews.map((review) => review.authorUserId))];
    const users = await this.prisma.users.findMany({
      where: { id: { in: authorIds } },
      select: { id: true, firstName: true, lastName: true }
    });
    const usersById = new Map(users.map((user) => [user.id, user]));

    return reviews.map((review) => {
      const author = usersById.get(review.authorUserId);
      const authorName = author ? `${author.firstName} ${author.lastName?.[0] ?? ""}.`.trim() : null;
      return {
        id: review.id,
        serviceOrderId: review.serviceOrderId,
        authorUserId: review.authorUserId,
        professionalId: review.professionalId,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        professionalReply: review.professionalReply,
        professionalRepliedAt: review.professionalRepliedAt,
        status: review.status,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        authorName
      };
    });
  }
}
