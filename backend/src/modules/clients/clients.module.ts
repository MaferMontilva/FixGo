import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { GetMyClientProfileUseCase } from "./application/get-my-client-profile.use-case";
import { UpdateMyClientProfileUseCase } from "./application/update-my-client-profile.use-case";
import { CLIENTS_REPOSITORY } from "./domain/clients.repository";
import { PrismaClientsRepository } from "./infrastructure/prisma/prisma-clients.repository";
import { ClientsController } from "./presentation/http/clients.controller";

@Module({
  imports: [AuthModule],
  controllers: [ClientsController],
  providers: [
    GetMyClientProfileUseCase,
    UpdateMyClientProfileUseCase,
    {
      provide: CLIENTS_REPOSITORY,
      useClass: PrismaClientsRepository
    }
  ]
})
export class ClientsModule {}
