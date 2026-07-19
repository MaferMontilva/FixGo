import { useMemo, useState } from "react";
import { LoginPage } from "../modules/auth/LoginPage";
import { HomeMarketplacePage } from "../modules/home/HomeMarketplacePage";
import { LandingPage } from "../modules/home/LandingPage";
import { BudgetsPage } from "../modules/budgets/BudgetsPage";
import { ProfessionalsPage } from "../modules/professionals/ProfessionalsPage";
import { ServiceRequestPage } from "../modules/service-request/ServiceRequestPage";

export type AppRoute = "landing" | "home" | "request" | "budgets" | "professionals" | "login";

export function App() {
  const [route, setRoute] = useState<AppRoute>("landing");

  const page = useMemo(() => {
    if (route === "home") return <HomeMarketplacePage onNavigate={setRoute} />;
    if (route === "request") return <ServiceRequestPage onNavigate={setRoute} />;
    if (route === "budgets") return <BudgetsPage onNavigate={setRoute} />;
    if (route === "professionals") return <ProfessionalsPage onNavigate={setRoute} />;
    if (route === "login") return <LoginPage onNavigate={setRoute} />;
    return <LandingPage onNavigate={setRoute} />;
  }, [route]);

  return page;
}
