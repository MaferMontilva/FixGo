import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  CLIENTS_REPOSITORY,
  ClientsRepository,
  UpdateClientProfileData
} from "../domain/clients.repository";

@Injectable()
export class UpdateMyClientProfileUseCase {
  constructor(@Inject(CLIENTS_REPOSITORY) private readonly clientsRepository: ClientsRepository) {}

  async execute(userId: number, data: UpdateClientProfileData) {
    const profile = await this.clientsRepository.findProfileByUserId(userId);

    if (!profile) {
      throw new NotFoundException("Perfil de cliente no encontrado.");
    }

    return this.clientsRepository.updateProfile(userId, {
      displayName: data.displayName?.trim(),
      notes: data.notes === undefined ? undefined : data.notes?.trim() || null
    });
  }
}
