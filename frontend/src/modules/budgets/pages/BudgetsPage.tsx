import { ClipboardList, PlusCircle } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Card } from "../../../shared/components/Card";
import { PageContainer } from "../../../shared/components/PageContainer";
import { useAuth } from "../../auth";

export function BudgetsPage() {
  const { user } = useAuth();
  const firstName = user?.firstName ?? "cliente";

  return (
    <PageContainer className="empty-session">
      <Card className="session-card">
        <div className="session-icon"><ClipboardList size={42} /></div>
        <h1>Aún no tienes solicitudes de presupuesto.</h1>
        <p>
          Hola, {firstName}. Cuando publiques solicitudes y recibas ofertas, las veras aqui con sus estados.
        </p>
        <Button to="/cliente/solicitar-presupuesto" variant="wide">
          <PlusCircle size={22} />
          Solicitar mi primer presupuesto
        </Button>
      </Card>
    </PageContainer>
  );
}
