import { ClientProfileEntity } from "./client-profile.entity";

export const CLIENTS_REPOSITORY = Symbol("CLIENTS_REPOSITORY");

export type UpdateClientProfileData = {
  displayName?: string;
  notes?: string | null;
};

export abstract class ClientsRepository {
  abstract findProfileByUserId(userId: number): Promise<ClientProfileEntity | null>;
  abstract updateProfile(userId: number, data: UpdateClientProfileData): Promise<ClientProfileEntity>;
}
