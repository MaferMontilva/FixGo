import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Card } from "../../../shared/components/Card";
import { Logo } from "../../../shared/components/Logo";
import { PageContainer } from "../../../shared/components/PageContainer";

const legalContent = {
  terminos: {
    title: "Términos y condiciones",
    body: "Documento informativo pendiente de redacción final. FixGo mostrará aquí las condiciones de uso cuando la fase legal del producto esté preparada."
  },
  privacidad: {
    title: "Política de Privacidad",
    body: "Documento informativo pendiente de redacción final. FixGo mostrará aquí la información de privacidad antes de activar funcionalidades con datos personales reales."
  },
  cookies: {
    title: "Política de Cookies",
    body: "Documento informativo pendiente de redacción final. FixGo mostrará aquí la política de cookies cuando se definan los servicios de analítica o preferencias."
  }
} as const;

export function LegalPage() {
  const { documentType } = useParams();
  const content = legalContent[documentType as keyof typeof legalContent] ?? legalContent.terminos;

  return (
    <PageContainer className="legal-shell">
      <Card className="legal-card">
        <Logo compact />
        <h1>{content.title}</h1>
        <p>{content.body}</p>
        <Link className="back-link" to="/">
          <ArrowLeft size={18} />
          Volver al inicio
        </Link>
      </Card>
    </PageContainer>
  );
}
