export type AuthRole = "CLIENT" | "PROFESSIONAL" | "ADMIN" | "SUPER_ADMIN";

export type ClientProfile = {
  id: number;
  displayName: string | null;
  notes: string | null;
};

export type AuthUser = {
  id: number;
  email: string | null;
  firstName: string;
  lastName: string;
  roles: AuthRole[];
  mustChangePassword?: boolean;
  clientProfile?: ClientProfile | null;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  firstName: string;
  lastName: string;
};

export type RegisterProfessionalPayload = RegisterPayload & {
  businessName?: string;
  phone?: string;
};
