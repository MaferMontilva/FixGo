import { ArrowLeft, ClipboardList, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../../shared/components/Button";
import { Card } from "../../../shared/components/Card";
import { PageContainer } from "../../../shared/components/PageContainer";

export function ProfessionalHomePage() {
  return (
    <PageContainer className="empty-session professional-home">
      <Card className="session-card professional-home-card">
        <div className="session-icon">
          <ClipboardList size={42} />
        </div>
        <h1>Panel del profesional</h1>
        <p>El profesional podrá consultar solicitudes de clientes y enviar presupuestos desde FixGo.</p>
        <Button to="/cliente/solicitar-presupuesto" variant="wide">
          <Send size={22} />
          Ver flujo de solicitudes
        </Button>
        <div className="benefits">
          <strong>Próximamente podrás:</strong>
          <div className="benefit-row">
            <ClipboardList size={26} />
            <span>Revisar solicitudes, analizar necesidades del cliente y preparar presupuestos.</span>
          </div>
        </div>
        <Link className="back-link" to="/">
          <ArrowLeft size={18} />
          Volver al inicio
        </Link>
      </Card>
    </PageContainer>
  );
}
