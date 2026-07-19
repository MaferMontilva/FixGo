import logoUrl from "../assets/fixgo-logo.png";

type LogoProps = {
  compact?: boolean;
};

export function Logo({ compact = false }: LogoProps) {
  return (
    <div className={compact ? "logo logo-compact" : "logo"} aria-label="FixGo">
      <img src={logoUrl} alt="FixGo" />
    </div>
  );
}
