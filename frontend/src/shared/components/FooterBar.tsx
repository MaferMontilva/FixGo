import { Link } from "react-router-dom";
import { Logo } from "./Logo";

export function FooterBar() {
  return (
    <footer className="footer-bar">
      <div className="footer-links">
        <Link to="/legal/terminos">Términos y condiciones</Link>
        <Link to="/legal/privacidad">Política de Privacidad</Link>
        <Link to="/legal/cookies">Política de Cookies</Link>
      </div>
      <div className="powered">
        <span>Powered by</span>
        <Logo compact />
      </div>
    </footer>
  );
}
