import { Navigate, Route, Routes } from "react-router-dom";
import { MarketplaceLayout } from "../layouts/MarketplaceLayout";
import { PublicLayout } from "../layouts/PublicLayout";
import { LoginPage, RegisterPage, RoleProtectedRoute } from "../../modules/auth";
import { BudgetsPage } from "../../modules/budgets";
import { HomeMarketplacePage, LandingPage, LegalPage, NotFoundPage } from "../../modules/home";
import { ProfessionalHomePage, ProfessionalsPage } from "../../modules/professionals";
import { ServiceRequestPage } from "../../modules/service-requests";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/acceder" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/profesional/inicio" element={<ProfessionalHomePage />} />
        <Route path="/legal/:documentType" element={<LegalPage />} />
      </Route>

      <Route path="/cliente" element={<MarketplaceLayout />}>
        <Route index element={<Navigate to="/cliente/inicio" replace />} />
        <Route path="inicio" element={<HomeMarketplacePage />} />
        <Route path="solicitar-presupuesto" element={<ServiceRequestPage />} />
        <Route
          path="mis-presupuestos"
          element={
            <RoleProtectedRoute roles={["CLIENT"]}>
              <BudgetsPage />
            </RoleProtectedRoute>
          }
        />
        <Route path="profesionales" element={<ProfessionalsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
