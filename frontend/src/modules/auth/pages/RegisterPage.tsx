import { ArrowLeft, ArrowRight, BriefcaseBusiness, UserPlus, UserRound } from "lucide-react";
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
  businessName?: string;
  phone?: string;
  addressLine1?: string;
  postalCode?: string;
  city?: string;
};

const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
const BUSINESS_NAME_REGEX = /^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ.,&' -]+$/;
const PHONE_REGEX = /^[+]?[\d\s()-]{7,20}$/;
const POSTAL_REGEX = /^[\d A-Za-z-]{3,12}$/;

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { initializing, isAuthenticated, register, registerProfessional, hasRole } = useAuth();
  const initialType = (location.state as { role?: AccountType } | null)?.role ?? null;
  const [accountType, setAccountType] = useState<AccountType | null>(initialType);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", businessName: "", phone: "", addressLine1: "", postalCode: "", city: "" });
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
    const trimmedFirstName = form.firstName.trim();
    const trimmedLastName = form.lastName.trim();
    const trimmedBusinessName = form.businessName.trim();
    const trimmedPhone = form.phone.trim();

    if (trimmedFirstName.length < 2 || trimmedFirstName.length > 80) {
      nextErrors.firstName = "El nombre debe tener entre 2 y 80 caracteres.";
    } else if (!NAME_REGEX.test(trimmedFirstName)) {
      nextErrors.firstName = "El nombre solo puede contener letras.";
    }

    if (trimmedLastName.length < 2 || trimmedLastName.length > 80) {
      nextErrors.lastName = "El apellido debe tener entre 2 y 80 caracteres.";
    } else if (!NAME_REGEX.test(trimmedLastName)) {
      nextErrors.lastName = "El apellido solo puede contener letras.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = "Escribe un correo valido.";
    if (form.password.length < 8) nextErrors.password = "Minimo 8 caracteres.";
    if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
      nextErrors.password = "Debe contener al menos una letra y un numero.";
    }

    if (isProfessional && trimmedBusinessName) {
      if (trimmedBusinessName.length < 2 || trimmedBusinessName.length > 120) {
        nextErrors.businessName = "El nombre del negocio debe tener entre 2 y 120 caracteres.";
      } else if (!BUSINESS_NAME_REGEX.test(trimmedBusinessName)) {
        nextErrors.businessName = "El nombre del negocio contiene caracteres no permitidos.";
      }
    }

    if (!trimmedPhone) {
      nextErrors.phone = "El telefono es obligatorio.";
    } else if (!PHONE_REGEX.test(trimmedPhone)) {
      nextErrors.phone = "Escribe un telefono valido.";
    }

    const trimmedAddress = form.addressLine1.trim();
    const trimmedPostal = form.postalCode.trim();
    const trimmedCity = form.city.trim();

    if (trimmedAddress.length < 4) {
      nextErrors.addressLine1 = "La direccion es obligatoria (mínimo 4 caracteres).";
    }
    if (!POSTAL_REGEX.test(trimmedPostal)) {
      nextErrors.postalCode = "Escribe un codigo postal valido.";
    }
    if (trimmedCity.length < 2) {
      nextErrors.city = "La ciudad o localidad es obligatoria.";
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
      const sharedData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone.trim(),
        addressLine1: form.addressLine1.trim(),
        postalCode: form.postalCode.trim(),
        city: form.city.trim()
      };
      if (isProfessional) {
        await registerProfessional({
          ...sharedData,
          businessName: form.businessName.trim() || undefined
        });
      } else {
        await register(sharedData);
      }
    } catch (error) {
      const apiError = error as ApiError;
      setServerError(apiError.message || "No pudimos crear tu cuenta. Intenta nuevamente.");
      setIsSubmitting(false);
    }
  };

  if (accountType === null) {
    return (
      <PageContainer className="login-shell">
        <Card className="login-card auth-card">
          <Logo compact />
          <h1 className="login-title">Crear cuenta</h1>
          <p className="login-intro">Elige cómo quieres usar FixGo para empezar.</p>
          <div className="role-choice-list">
            <button className="role-choice-card" type="button" onClick={() => setAccountType("CLIENT")}>
              <span className="role-choice-icon"><UserRound size={24} /></span>
              <span className="role-choice-text">
                <strong>Soy cliente</strong>
                <small>Solicita servicios para tu hogar y recibe presupuestos.</small>
              </span>
              <ArrowRight size={20} />
            </button>
            <button className="role-choice-card" type="button" onClick={() => setAccountType("PROFESSIONAL")}>
              <span className="role-choice-icon"><BriefcaseBusiness size={24} /></span>
              <span className="role-choice-text">
                <strong>Soy profesional</strong>
                <small>Ofrece tus servicios y recibe oportunidades de trabajo.</small>
              </span>
              <ArrowRight size={20} />
            </button>
          </div>
          <p className="auth-switch">
            Ya tienes cuenta?{" "}
            <Link to="/acceder" state={{ from: destination }}>
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

  return (
    <PageContainer className="login-shell">
      <Card className="login-card auth-card">
        <Logo compact />
        <button className="auth-back-choice" type="button" onClick={() => setAccountType(null)}>
          <ArrowLeft size={16} /> Cambiar tipo de cuenta
        </button>
        <h1 className="login-title">{isProfessional ? "Crear cuenta de profesional" : "Crear cuenta de cliente"}</h1>
        <p className="login-intro">
          {isProfessional
            ? "Registra tus datos para ofrecer tus servicios y recibir oportunidades."
            : "Registra tus datos para guardar solicitudes, presupuestos y perfil de cliente."}
        </p>
        <form className="auth-form auth-form-grid" onSubmit={handleSubmit} noValidate>
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
            <AuthFormField
              id="register-business-name"
              label="Nombre del negocio (opcional)"
              autoComplete="organization"
              value={form.businessName}
              error={errors.businessName}
              onChange={(event) => updateField("businessName", event.target.value)}
            />
          ) : null}
          <AuthFormField
            id="register-phone"
            label="Teléfono"
            autoComplete="tel"
            value={form.phone}
            error={errors.phone}
            onChange={(event) => updateField("phone", event.target.value)}
          />
          <AuthFormField
            id="register-address"
            label="Dirección"
            autoComplete="street-address"
            value={form.addressLine1}
            error={errors.addressLine1}
            onChange={(event) => updateField("addressLine1", event.target.value)}
          />
          <AuthFormField
            id="register-postal"
            label="Código postal"
            autoComplete="postal-code"
            value={form.postalCode}
            error={errors.postalCode}
            onChange={(event) => updateField("postalCode", event.target.value)}
          />
          <AuthFormField
            id="register-city"
            label="Ciudad o localidad"
            autoComplete="address-level2"
            value={form.city}
            error={errors.city}
            onChange={(event) => updateField("city", event.target.value)}
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
