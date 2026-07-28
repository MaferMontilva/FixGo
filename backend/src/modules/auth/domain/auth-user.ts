export type AuthUser = {
  id: number;
  email: string | null;
  firstName: string;
  lastName: string;
  roles: string[];
  mustChangePassword: boolean;
};
