import { Navigate, Route, Routes } from "react-router-dom";
import { MarketplaceLayout } from "../layouts/MarketplaceLayout";
import { PublicLayout } from "../layouts/PublicLayout";
import { LoginPage } from "../../modules/auth/pages/LoginPage";
import { BudgetsPage } from "../../modules/budgets/pages/BudgetsPage";
import { HomeMarketplacePage } from "../../modules/home/pages/HomeMarketplacePage";
import { LandingPage } from "../../modules/home/pages/LandingPage";
import { NotFoundPage } from "../../modules/home/pages/NotFoundPage";
import { ProfessionalHomePage } from "../../modules/professionals/pages/ProfessionalHomePage";
import { ProfessionalsPage } from "../../modules/professionals/pages/ProfessionalsPage";
import { ServiceRequestPage } from "../../modules/service-requests/pages/ServiceRequestPage";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/acceder" element={<LoginPage />} />
        <Route path="/profesional/inicio" element={<ProfessionalHomePage />} />
      </Route>

      <Route path="/cliente" element={<MarketplaceLayout />}>
        <Route index element={<Navigate to="/cliente/inicio" replace />} />
        <Route path="inicio" element={<HomeMarketplacePage />} />
        <Route path="solicitar-presupuesto" element={<ServiceRequestPage />} />
        <Route path="mis-presupuestos" element={<BudgetsPage />} />
        <Route path="profesionales" element={<ProfessionalsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
