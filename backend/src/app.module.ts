import { Module } from "@nestjs/common";
import { PrismaModule } from "./shared/prisma.module";
import { AdministrationModule } from "./modules/administration/administration.module";
import { ArtificialIntelligenceModule } from "./modules/artificial-intelligence/artificial-intelligence.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BudgetsModule } from "./modules/budgets/budgets.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { ClientsModule } from "./modules/clients/clients.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { ProfessionalsModule } from "./modules/professionals/professionals.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { ServiceRequestsModule } from "./modules/service-requests/service-requests.module";
import { ServicesModule } from "./modules/services/services.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    CategoriesModule,
    ProfessionalsModule,
    ServiceRequestsModule,
    BudgetsModule,
    ArtificialIntelligenceModule,
    ServicesModule,
    ReviewsModule,
    NotificationsModule,
    AdministrationModule
  ]
})
export class AppModule {}
