export type ApiError = {
  status: number;
  message: string;
  path: string;
  details?: string[];
};
