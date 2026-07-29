export type ClientProfileSummary = {
  id: number;
  displayName: string | null;
  notes: string | null;
};

export type UserEntity = {
  id: number;
  email: string | null;
  firstName: string;
  lastName: string;
  status: string;
  roles: string[];
  clientProfile: ClientProfileSummary | null;
};
