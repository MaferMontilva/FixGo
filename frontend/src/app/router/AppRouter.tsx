import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { MarketplaceLayout } from "../layouts/MarketplaceLayout";
import { PublicLayout } from "../layouts/PublicLayout";
import { ChangePasswordPage, LoginPage, RegisterPage, ResetPasswordPage, RoleProtectedRoute, useAuth } from "../../modules/auth";
import { BudgetsPage, ProfessionalBudgetsPage, RequestBudgetsPage } from "../../modules/budgets";
import { ClientOrdersPage, ProfessionalOrdersPage } from "../../modules/service-orders";
import { AdminDashboardPage } from "../../modules/admin";
import { ProfessionalReviewsPage } from "../../modules/reviews";
import { HomeMarketplacePage, LandingPage, LegalPage, NotFoundPage } from "../../modules/home";
import { ProfessionalDashboardPage, ProfessionalHomePage, ProfessionalOpportunityDetailPage, ProfessionalOpportunitiesPage, ProfessionalProfilePage, ProfessionalsPage } from "../../modules/professionals";
import { ServiceRequestPage } from "../../modules/service-requests";

export function AppRouter() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Si el usuario tiene una clave temporal, se le obliga a cambiarla antes de
  // poder navegar a cualquier otra pantalla.
  if (isAuthenticated && user?.mustChangePassword && location.pathname !== "/cambiar-clave") {
    return <Navigate to="/cambiar-clave" replace />;
  }

  return (
    <Routes>
      <Route path="/cambiar-clave" element={<ChangePasswordPage />} />
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/acceder" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/recuperar" element={<ResetPasswordPage />} />
        <Route path="/profesional/inicio" element={<RoleProtectedRoute roles={["PROFESSIONAL"]}><ProfessionalHomePage /></RoleProtectedRoute>} />
        <Route path="/profesional/panel" element={<RoleProtectedRoute roles={["PROFESSIONAL"]}><ProfessionalDashboardPage /></RoleProtectedRoute>} />
        <Route path="/profesional/perfil" element={<RoleProtectedRoute roles={["PROFESSIONAL"]}><ProfessionalProfilePage /></RoleProtectedRoute>} />
        <Route path="/profesional/oportunidades" element={<RoleProtectedRoute roles={["PROFESSIONAL"]}><ProfessionalOpportunitiesPage /></RoleProtectedRoute>} />
        <Route path="/profesional/oportunidades/:id" element={<RoleProtectedRoute roles={["PROFESSIONAL"]}><ProfessionalOpportunityDetailPage /></RoleProtectedRoute>} />
        <Route path="/profesional/trabajos" element={<RoleProtectedRoute roles={["PROFESSIONAL"]}><ProfessionalOrdersPage /></RoleProtectedRoute>} />
        <Route path="/profesional/presupuestos" element={<RoleProtectedRoute roles={["PROFESSIONAL"]}><ProfessionalBudgetsPage /></RoleProtectedRoute>} />
        <Route path="/profesional/valoraciones" element={<RoleProtectedRoute roles={["PROFESSIONAL"]}><ProfessionalReviewsPage /></RoleProtectedRoute>} />
        <Route path="/legal/:documentType" element={<LegalPage />} />
      </Route>

      <Route path="/cliente" element={<MarketplaceLayout />}>
        <Route index element={<Navigate to="/cliente/inicio" replace />} />
        <Route path="inicio" element={<HomeMarketplacePage />} />
        <Route
          path="solicitar-presupuesto"
          element={
            <RoleProtectedRoute roles={["CLIENT"]}>
              <ServiceRequestPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="mis-presupuestos"
          element={
            <RoleProtectedRoute roles={["CLIENT"]}>
              <BudgetsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="solicitudes/:id/presupuestos"
          element={
            <RoleProtectedRoute roles={["CLIENT"]}>
              <RequestBudgetsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="trabajos"
          element={
            <RoleProtectedRoute roles={["CLIENT"]}>
              <ClientOrdersPage />
            </RoleProtectedRoute>
          }
        />
        <Route path="profesionales" element={<ProfessionalsPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <RoleProtectedRoute roles={["ADMIN"]}>
            <AdminDashboardPage />
          </RoleProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
