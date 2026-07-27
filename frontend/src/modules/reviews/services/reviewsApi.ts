import { httpGet, httpPost } from "../../../shared/http/httpClient";
import type { CreateReviewPayload, Review } from "../types/review";

export function createReview(payload: CreateReviewPayload) {
  return httpPost<Review, CreateReviewPayload>("/reviews", payload);
}

export function getProfessionalReviews(professionalId: number) {
  return httpGet<Review[]>(`/reviews/professional/${professionalId}`);
}

export function getMyReviews() {
  return httpGet<Review[]>("/reviews/mine");
}
