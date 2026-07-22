import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CLIENTS_REPOSITORY, ClientsRepository } from "../domain/clients.repository";

@Injectable()
export class GetMyClientProfileUseCase {
  constructor(@Inject(CLIENTS_REPOSITORY) private readonly clientsRepository: ClientsRepository) {}

  async execute(userId: number) {
    const profile = await this.clientsRepository.findProfileByUserId(userId);

    if (!profile) {
      throw new NotFoundException("Perfil de cliente no encontrado.");
    }

    return profile;
  }
}
