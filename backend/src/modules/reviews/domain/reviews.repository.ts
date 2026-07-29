import { ReviewEntity } from "./review.entity";

export const REVIEWS_REPOSITORY = Symbol("REVIEWS_REPOSITORY");

export type ServiceOrderForReview = {
  id: number;
  clientUserId: number;
  professionalId: number;
  status: string;
};

export type CreateReviewData = {
  serviceOrderId: number;
  authorUserId: number;
  professionalId: number;
  rating: number;
  title?: string | null;
  comment?: string | null;
};

export abstract class ReviewsRepository {
  abstract findProfessionalIdByUserId(userId: number): Promise<number | null>;
  abstract findProfessionalUserId(professionalId: number): Promise<number | null>;
  abstract findServiceOrderForReview(serviceOrderId: number): Promise<ServiceOrderForReview | null>;
  abstract findExistingReview(serviceOrderId: number, authorUserId: number): Promise<ReviewEntity | null>;
  abstract createReview(data: CreateReviewData): Promise<ReviewEntity>;
  abstract findReviewsByProfessionalId(professionalId: number): Promise<ReviewEntity[]>;
  abstract replyToReview(reviewId: number, professionalId: number, reply: string): Promise<ReviewEntity | null>;
}
