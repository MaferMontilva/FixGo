import { ArrowLeft, BriefcaseBusiness, UserPlus, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/Button";
import { Card } from "../../../shared/components/Card";
import { Logo } from "../../../shared/components/Logo";
import { PageContainer } from "../../../shared/components/PageContainer";
import type { ApiError } from "../../../shared/types/apiError";
import { AuthFormField } from "../components/AuthFormField";
import { useAuth } from "../hooks/useAuth";

type AccountType = "CLIENT" | "PROFESSIONAL";

type RegisterErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
};

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { initializing, isAuthenticated, register, registerProfessional, hasRole } = useAuth();
  const initialType = (location.state as { role?: AccountType } | null)?.role ?? "CLIENT";
  const [accountType, setAccountType] = useState<AccountType>(initialType);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", businessName: "", phone: "" });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const destination = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
  const destinationPath = destination ? `${destination.pathname ?? ""}${destination.search ?? ""}` : "";
  const isProfessional = accountType === "PROFESSIONAL";

  useEffect(() => {
    if (initializing || !isAuthenticated) return;

    if (hasRole("PROFESSIONAL")) {
      navigate("/profesional/inicio", { replace: true });
    } else if (hasRole("CLIENT")) {
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
      if (isProfessional) {
        await registerProfessional({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          businessName: form.businessName.trim() || undefined,
          phone: form.phone.trim() || undefined
        });
      } else {
        await register({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password
        });
      }
    } catch (error) {
      const apiError = error as ApiError;
      setServerError(apiError.message || "No pudimos crear tu cuenta. Intenta nuevamente.");
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer className="login-shell">
      <Card className="login-card auth-card">
        <Logo compact />
        <h1 className="login-title">{isProfessional ? "Crear cuenta de profesional" : "Crear cuenta de cliente"}</h1>
        <p className="login-intro">
          {isProfessional
            ? "Registra tus datos para ofrecer tus servicios y recibir oportunidades."
            : "Registra tus datos para guardar solicitudes, presupuestos y perfil de cliente."}
        </p>
        <div className="role-segment two">
          <button
            className={`role-chip ${accountType === "CLIENT" ? "is-active" : ""}`}
            type="button"
            onClick={() => setAccountType("CLIENT")}
          >
            <UserRound size={18} />
            Cliente
          </button>
          <button
            className={`role-chip ${accountType === "PROFESSIONAL" ? "is-active" : ""}`}
            type="button"
            onClick={() => setAccountType("PROFESSIONAL")}
          >
            <BriefcaseBusiness size={18} />
            Profesional
          </button>
        </div>
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
          {isProfessional ? (
            <>
              <AuthFormField
                id="register-business-name"
                label="Nombre del negocio (opcional)"
                autoComplete="organization"
                value={form.businessName}
                onChange={(event) => updateField("businessName", event.target.value)}
              />
              <AuthFormField
                id="register-phone"
                label="Telefono (opcional)"
                autoComplete="tel"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
              />
            </>
          ) : null}
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
          Ya tienes cuenta?{" "}
          <Link to="/acceder" state={{ from: destination, role: accountType }}>
            Iniciar sesion
          </Link>
        </p>
        <Link className="back-link" to="/">
          <ArrowLeft size={18} /> Volver al inicio
        </Link>
      </Card>
    </PageContainer>
  );
}
