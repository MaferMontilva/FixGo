import { ArrowLeft, UserPlus } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/Button";
import { Card } from "../../../shared/components/Card";
import { Logo } from "../../../shared/components/Logo";
import { PageContainer } from "../../../shared/components/PageContainer";
import type { ApiError } from "../../../shared/types/apiError";
import { AuthFormField } from "../components/AuthFormField";
import { useAuth } from "../hooks/useAuth";

type RegisterErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
};

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { initializing, isAuthenticated, register, hasRole } = useAuth();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const destination = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
  const destinationPath = destination ? `${destination.pathname ?? ""}${destination.search ?? ""}` : "";

  useEffect(() => {
    if (!initializing && isAuthenticated && hasRole("CLIENT")) {
      navigate(destinationPath?.startsWith("/cliente") ? destinationPath : "/cliente/inicio", { replace: true });
    }
  }, [destinationPath, hasRole, initializing, isAuthenticated, navigate]);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validate = () => {
    const nextErrors: RegisterErrors = {};

    if (form.firstName.trim().length < 2) nextErrors.firstName = "Minimo 2 caracteres.";
    if (form.lastName.trim().length < 2) nextErrors.lastName = "Minimo 2 caracteres.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = "Escribe un correo valido.";
    if (form.password.length < 8) nextErrors.password = "Minimo 8 caracteres.";
    if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
      nextErrors.password = "Debe contener al menos una letra y un numero.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError("");

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await register(form);
      navigate(destinationPath?.startsWith("/cliente") ? destinationPath : "/cliente/inicio", { replace: true });
    } catch (error) {
      const apiError = error as ApiError;
      setServerError(apiError.message || "No pudimos crear tu cuenta. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer className="login-shell">
      <Card className="login-card auth-card">
        <Logo compact />
        <h1 className="login-title">Crear cuenta de cliente</h1>
        <p className="login-intro">Registra tus datos para guardar solicitudes, presupuestos y perfil de cliente.</p>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <AuthFormField
            id="register-first-name"
            label="Nombre"
            autoComplete="given-name"
            value={form.firstName}
            error={errors.firstName}
            onChange={(event) => updateField("firstName", event.target.value)}
          />
          <AuthFormField
            id="register-last-name"
            label="Apellido"
            autoComplete="family-name"
            value={form.lastName}
            error={errors.lastName}
            onChange={(event) => updateField("lastName", event.target.value)}
          />
          <AuthFormField
            id="register-email"
            label="Correo electronico"
            type="email"
            autoComplete="email"
            value={form.email}
            error={errors.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
          <AuthFormField
            id="register-password"
            label="Contrasena"
            type="password"
            autoComplete="new-password"
            value={form.password}
            error={errors.password}
            onChange={(event) => updateField("password", event.target.value)}
          />
          {serverError ? <p className="form-error server-error">{serverError}</p> : null}
          <Button className="auth-submit" type="submit" variant="wide" disabled={isSubmitting}>
            <UserPlus size={20} />
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </form>
        <p className="auth-switch">
          Ya tienes cuenta? <Link to="/acceder" state={location.state}>Iniciar sesion</Link>
        </p>
        <Link className="back-link" to="/">
          <ArrowLeft size={18} /> Volver al inicio
        </Link>
      </Card>
    </PageContainer>
  );
}
