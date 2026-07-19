import { Module } from "@nestjs/common";
import { ArtificialIntelligenceModule } from "./modules/artificial-intelligence/artificial-intelligence.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BudgetsModule } from "./modules/budgets/budgets.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { ClientsModule } from "./modules/clients/clients.module";
import { ProfessionalsModule } from "./modules/professionals/professionals.module";
import { ServiceRequestsModule } from "./modules/service-requests/service-requests.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ClientsModule,
    CategoriesModule,
    ProfessionalsModule,
    ServiceRequestsModule,
    BudgetsModule,
    ArtificialIntelligenceModule
  ]
})
export class AppModule {}
