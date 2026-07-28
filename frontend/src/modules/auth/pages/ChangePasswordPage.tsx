import { KeyRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/Button";
import { Card } from "../../../shared/components/Card";
import { Logo } from "../../../shared/components/Logo";
import { PageContainer } from "../../../shared/components/PageContainer";
import type { ApiError } from "../../../shared/types/apiError";
import { changePassword } from "../api/authApi";
import { AuthFormField } from "../components/AuthFormField";
import { useAuth } from "../hooks/useAuth";

type FieldErrors = { password?: string; confirm?: string };

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, reloadUser, hasRole } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const next: FieldErrors = {};
    if (password.length < 8) {
      next.password = "La contraseña debe tener al menos 8 caracteres.";
    } else if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(password)) {
      next.password = "Debe incluir al menos una letra y un número.";
    }
    if (confirm !== password) {
      next.confirm = "Las contraseñas no coinciden.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const destinationForRole = () => {
    if (hasRole("ADMIN")) return "/admin";
    if (hasRole("PROFESSIONAL")) return "/profesional/panel";
    return "/cliente/inicio";
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setServerError("");
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await changePassword(password);
      await reloadUser();
      navigate(destinationForRole(), { replace: true });
    } catch (error) {
      setServerError((error as ApiError).message || "No se pudo cambiar la contraseña. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className="auth-single">
        <Card>
          <div className="auth-card-head">
            <Logo compact />
            <h1><KeyRound size={22} /> Cambia tu contraseña</h1>
            <p>
              Hola {user?.firstName || ""}. Por seguridad, tu cuenta fue creada con una clave temporal y debes
              definir una contraseña nueva antes de continuar.
            </p>
          </div>

          {serverError ? <p className="form-error server-error">{serverError}</p> : null}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <AuthFormField
              id="new-password"
              label="Nueva contraseña"
              type="password"
              value={password}
              error={errors.password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo 8 caracteres, con letra y número"
              autoComplete="new-password"
            />
            <AuthFormField
              id="confirm-password"
              label="Repite la contraseña"
              type="password"
              value={confirm}
              error={errors.confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="Vuelve a escribirla"
              autoComplete="new-password"
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar y continuar"}
            </Button>
          </form>
        </Card>
      </div>
    </PageContainer>
  );
}
