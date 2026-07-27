import { ArrowLeft, BriefcaseBusiness, LogIn, ShieldCheck, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/Button";
import { Card } from "../../../shared/components/Card";
import { Logo } from "../../../shared/components/Logo";
import { PageContainer } from "../../../shared/components/PageContainer";
import type { ApiError } from "../../../shared/types/apiError";
import { AuthFormField } from "../components/AuthFormField";
import { useAuth } from "../hooks/useAuth";

type LoginRole = "CLIENT" | "PROFESSIONAL";

type LoginFormErrors = {
  email?: string;
  password?: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { initializing, isAuthenticated, login, hasRole } = useAuth();
  const initialRole = (location.state as { role?: LoginRole } | null)?.role ?? "CLIENT";
  const [role, setRole] = useState<LoginRole>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const destination = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
  const destinationPath = destination ? `${destination.pathname ?? ""}${destination.search ?? ""}` : "";

  useEffect(() => {
    if (initializing || !isAuthenticated) return;

    if (hasRole("PROFESSIONAL")) {
      navigate("/profesional/inicio", { replace: true });
    } else if (hasRole("CLIENT")) {
      navigate(destinationPath?.startsWith("/cliente") ? destinationPath : "/cliente/inicio", { replace: true });
    }
  }, [destinationPath, hasRole, initializing, isAuthenticated, navigate]);

  const validate = () => {
    const nextErrors: LoginFormErrors = {};

    if (!email.trim()) nextErrors.email = "Escribe tu correo.";
    if (!password) nextErrors.password = "Escribe tu contrasena.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError("");

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await login({ email, password });
    } catch (error) {
      const apiError = error as ApiError;
      setServerError(apiError.message || "No pudimos iniciar sesion. Revisa los datos e intenta nuevamente.");
      setIsSubmitting(false);
    }
  };

  const intro =
    role === "PROFESSIONAL"
      ? "Entra como profesional para gestionar tu perfil y ver oportunidades."
      : "Entra como cliente para gestionar tus solicitudes y presupuestos.";

  return (
    <PageContainer className="login-shell">
      <Card className="login-card auth-card">
        <Logo compact />
        <h1 className="login-title">Acceder a FixGo</h1>
        <p className="login-intro">{intro}</p>
        <div className="role-segment">
          <button
            className={`role-chip ${role === "CLIENT" ? "is-active" : ""}`}
            type="button"
            onClick={() => setRole("CLIENT")}
          >
            <UserRound size={18} />
            Cliente
          </button>
          <button
            className={`role-chip ${role === "PROFESSIONAL" ? "is-active" : ""}`}
            type="button"
            onClick={() => setRole("PROFESSIONAL")}
          >
            <BriefcaseBusiness size={18} />
            Profesional
          </button>
          <button className="role-chip is-disabled" type="button" disabled title="Disponible proximamente">
            <ShieldCheck size={18} />
            Admin
          </button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <AuthFormField
            id="login-email"
            label="Correo electronico"
            type="email"
            autoComplete="email"
            value={email}
            error={errors.email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <AuthFormField
            id="login-password"
            label="Contrasena"
            type="password"
            autoComplete="current-password"
            value={password}
            error={errors.password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {serverError ? <p className="form-error server-error">{serverError}</p> : null}
          <Button className="auth-submit" type="submit" variant="wide" disabled={isSubmitting}>
            <LogIn size={20} />
            {isSubmitting ? "Entrando..." : role === "PROFESSIONAL" ? "Entrar como profesional" : "Entrar como cliente"}
          </Button>
        </form>
        <p className="auth-switch">
          Aun no tienes cuenta?{" "}
          <Link to="/registro" state={{ from: destination, role }}>
            {role === "PROFESSIONAL" ? "Crear cuenta de profesional" : "Crear cuenta de cliente"}
          </Link>
        </p>
        <Link className="back-link" to="/">
          <ArrowLeft size={18} /> Volver al inicio
        </Link>
      </Card>
    </PageContainer>
  );
}
