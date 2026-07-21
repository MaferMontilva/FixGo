import { ArrowLeft, ClipboardList, Send } from "lucide-react";
import { Link } from "react-router-dom";

export function ProfessionalHomePage() {
  return (
    <section className="empty-session professional-home">
      <div className="session-card professional-home-card">
        <div className="session-icon">
          <ClipboardList size={42} />
        </div>
        <h1>Panel del profesional</h1>
        <p>El profesional podra consultar solicitudes de clientes y enviar presupuestos desde FixGo.</p>
        <Link className="primary-wide" to="/cliente/solicitar-presupuesto">
          <Send size={22} />
          Ver flujo de solicitudes
        </Link>
        <div className="benefits">
          <strong>Proximamente podras:</strong>
          <div className="benefit-row">
            <ClipboardList size={26} />
            <span>Revisar solicitudes, analizar necesidades del cliente y preparar presupuestos.</span>
          </div>
        </div>
        <Link className="back-link" to="/">
          <ArrowLeft size={18} />
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
