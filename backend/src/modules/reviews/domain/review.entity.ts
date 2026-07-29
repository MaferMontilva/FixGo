export type ReviewEntity = {
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
  authorName: string | null;
};

export type ProfessionalRatingSummary = {
  ratingAverage: number;
  ratingsCount: number;
};
