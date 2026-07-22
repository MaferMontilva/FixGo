import { ArrowLeft, BriefcaseBusiness, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../../shared/components/Button";
import { Card } from "../../../shared/components/Card";
import { Logo } from "../../../shared/components/Logo";
import { PageContainer } from "../../../shared/components/PageContainer";

export function LoginPage() {
  return (
    <PageContainer className="login-shell">
      <Card className="login-card">
        <Logo compact />
        <h1 className="login-title">Acceder a FixGo</h1>
        <p className="login-intro">Selecciona el tipo de acceso para continuar. La autenticación real se integrará más adelante.</p>
        <div className="role-access-list">
          <Button className="role-access-button" to="/cliente/inicio" variant="wide">
            <UserRound size={22} />
            Acceder como cliente
          </Button>
          <Button className="role-access-button" to="/profesional/inicio" variant="wide">
            <BriefcaseBusiness size={22} />
            Acceder como profesional
          </Button>
          <Button className="role-access-button" variant="neutral" disabled>
            <ShieldCheck size={22} />
            Administrador próximamente
          </Button>
        </div>
        <Link className="back-link" to="/"><ArrowLeft size={18} /> Volver al inicio</Link>
      </Card>
    </PageContainer>
  );
}
