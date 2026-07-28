import { ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../shared/components/Button";
import { Card } from "../../../shared/components/Card";
import { Logo } from "../../../shared/components/Logo";
import { PageContainer } from "../../../shared/components/PageContainer";
import type { ApiError } from "../../../shared/types/apiError";
import { resetPassword } from "../api/authApi";
import { AuthFormField } from "../components/AuthFormField";

type ResetErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;

export function ResetPasswordPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<ResetErrors>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validate = () => {
    const nextErrors: ResetErrors = {};
    const trimmedFirstName = form.firstName.trim();
    const trimmedLastName = form.lastName.trim();

    if (trimmedFirstName.length < 2 || !NAME_REGEX.test(trimmedFirstName)) {
      nextErrors.firstName = "El nombre solo puede contener letras.";
    }
    if (trimmedLastName.length < 2 || !NAME_REGEX.test(trimmedLastName)) {
      nextErrors.lastName = "El apellido solo puede contener letras.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = "Escribe un correo valido.";
    if (form.password.length < 8) nextErrors.password = "Minimo 8 caracteres.";
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
      nextErrors.password = "Debe contener al menos una letra y un numero.";
    }
    if (form.confirmPassword !== form.password) nextErrors.confirmPassword = "Las contrasenas no coinciden.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError("");

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await resetPassword({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password
      });
      setDone(true);
    } catch (error) {
      const apiError = error as ApiError;
      setServerError(apiError.message || "No pudimos restablecer la contrasena. Intenta nuevamente.");
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer className="login-shell">
      <Card className="login-card auth-card">
        <Logo compact />
        {done ? (
          <>
            <div className="reset-done-icon"><CheckCircle2 size={40} /></div>
            <h1 className="login-title">Contrasena actualizada</h1>
            <p className="login-intro">Ya puedes iniciar sesion con tu nueva contrasena.</p>
            <Link className="auth-submit reset-done-cta" to="/acceder">
              Iniciar sesion
            </Link>
            <Link className="back-link" to="/">
              <ArrowLeft size={18} /> Volver al inicio
            </Link>
          </>
        ) : (
          <>
            <h1 className="login-title">Recuperar contrasena</h1>
            <p className="login-intro">
              Verifica tu identidad con tu nombre, apellido y correo, y define una contrasena nueva.
            </p>
            <form className="auth-form auth-form-grid" onSubmit={handleSubmit} noValidate>
              <AuthFormField
                id="reset-first-name"
                label="Nombre"
                autoComplete="given-name"
                value={form.firstName}
                error={errors.firstName}
                onChange={(event) => updateField("firstName", event.target.value)}
              />
              <AuthFormField
                id="reset-last-name"
                label="Apellido"
                autoComplete="family-name"
                value={form.lastName}
                error={errors.lastName}
                onChange={(event) => updateField("lastName", event.target.value)}
              />
              <AuthFormField
                id="reset-email"
                label="Correo electronico"
                type="email"
                autoComplete="email"
                wrapperClassName="auth-field-full"
                value={form.email}
                error={errors.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
              <AuthFormField
                id="reset-password"
                label="Nueva contrasena"
                type="password"
                autoComplete="new-password"
                value={form.password}
                error={errors.password}
                onChange={(event) => updateField("password", event.target.value)}
              />
              <AuthFormField
                id="reset-confirm-password"
                label="Repite la nueva contrasena"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                error={errors.confirmPassword}
                onChange={(event) => updateField("confirmPassword", event.target.value)}
              />
              {serverError ? <p className="form-error server-error">{serverError}</p> : null}
              <Button className="auth-submit" type="submit" variant="wide" disabled={isSubmitting}>
                <KeyRound size={20} />
                {isSubmitting ? "Guardando..." : "Restablecer contrasena"}
              </Button>
            </form>
            <p className="auth-switch">
              Ya la recordaste?{" "}
              <Link to="/acceder">Iniciar sesion</Link>
            </p>
            <Link className="back-link" to="/">
              <ArrowLeft size={18} /> Volver al inicio
            </Link>
          </>
        )}
      </Card>
    </PageContainer>
  );
}
