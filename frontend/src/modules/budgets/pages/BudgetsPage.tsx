import { CheckCircle2, LogIn, Star } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Card } from "../../../shared/components/Card";
import { PageContainer } from "../../../shared/components/PageContainer";

export function BudgetsPage() {
  return (
    <PageContainer className="empty-session">
      <Card className="session-card">
        <div className="session-icon"><LogIn size={42} /></div>
        <h1>Ups! Parece que no estás conectado</h1>
        <p>Inicia sesión para acceder a esta sección y gestionar tus presupuestos</p>
        <Button to="/acceder" variant="wide"><LogIn size={22} /> Iniciar sesión</Button>
        <div className="benefits">
          <strong><Star size={18} /> Con tu cuenta podrás:</strong>
          <div className="benefit-row">
            <CheckCircle2 size={26} />
            <span>Ver todos tus presupuestos y consultar solicitudes anteriores.</span>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
