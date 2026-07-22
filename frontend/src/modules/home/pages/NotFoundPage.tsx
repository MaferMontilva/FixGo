import { ArrowRight, Home } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Card } from "../../../shared/components/Card";
import { Logo } from "../../../shared/components/Logo";
import { PageContainer } from "../../../shared/components/PageContainer";

export function NotFoundPage() {
  return (
    <PageContainer className="not-found-shell min-h-screen">
      <Card className="not-found-card">
        <Logo compact />
        <span className="eyebrow"><Home size={16} /> FixGo</span>
        <h1>Página no encontrada</h1>
        <p>La ruta que buscas no existe o ya no está disponible.</p>
        <Button className="large" to="/">
          Volver al inicio <ArrowRight size={18} />
        </Button>
      </Card>
    </PageContainer>
  );
}
