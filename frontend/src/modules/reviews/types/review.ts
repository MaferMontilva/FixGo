export type Review = {
  id: number;
  serviceOrderId: number;
  professionalId: number;
  rating: number;
  title: string | null;
  comment: string | null;
  professionalReply: string | null;
  professionalRepliedAt: string | null;
  createdAt: string;
  authorName: string | null;
};

export type CreateReviewPayload = {
  serviceOrderId: number;
  rating: number;
  title?: string;
  comment?: string;
};
