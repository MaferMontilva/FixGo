import { ArrowLeft } from "lucide-react";
import { AppRoute } from "../../app/App";
import { Logo } from "../../shared/components/Logo";

type Props = {
  onNavigate: (route: AppRoute) => void;
};

export function LoginPage({ onNavigate }: Props) {
  return (
    <main className="login-shell">
      <section className="login-card">
        <Logo compact />
        <label>Numero de telefono</label>
        <div className="phone-input">
          <button>🇪🇸 +34</button>
          <input placeholder="600 123 456" />
        </div>
        <button className="disabled-button">Continuar</button>
        <p>
          Al continuar, aceptas nuestros <strong>Terminos y Condiciones</strong> y <strong>Politica de Privacidad</strong>
        </p>
        <button className="back-link" onClick={() => onNavigate("landing")}><ArrowLeft size={18} /> Volver al inicio</button>
      </section>
    </main>
  );
}
