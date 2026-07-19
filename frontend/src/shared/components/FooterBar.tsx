import { Logo } from "./Logo";

export function FooterBar() {
  return (
    <footer className="footer-bar">
      <div className="footer-links">
        <a href="#terminos">Terminos y condiciones</a>
        <a href="#privacidad">Politica de Privacidad</a>
        <a href="#cookies">Politica de Cookies</a>
      </div>
      <div className="powered">
        <span>Powered by</span>
        <Logo compact />
      </div>
    </footer>
  );
}
