import { ArrowLeft, ArrowRight, Camera, CheckCircle2, Clock, Euro, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCategories } from "../../categories";
import { getServices } from "../../services";
import type { UiCategory } from "../../categories";
import type { ApiService } from "../../services";
import { spanishWorkAreas } from "../data/professionalOnboardingData";
import { getMyProfessionalProfile, saveMyProfessionalProfile } from "../services/professionalsApi";
import { clearProfessionalProfileDraft, loadProfessionalProfile, saveProfessionalProfile, saveProfessionalProfilePhoto } from "../storage/professionalOnboardingStorage";
import type { ProfessionalOnboardingProfile } from "../types/professionalOnboarding";

export function ProfessionalHomePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<ProfessionalOnboardingProfile>(() => loadProfessionalProfile());
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<UiCategory[]>([]);
  const [services, setServices] = useState<ApiService[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const codeRefs = useRef<Array<HTMLInputElement | null>>([]);
  const selectedProvince = useMemo(
    () => spanishWorkAreas.find((area) => area.province === profile.province) ?? spanishWorkAreas[0],
    [profile.province]
  );

  useEffect(() => {
    let cancelled = false;
    void getMyProfessionalProfile()
      .then((existingProfile) => {
        if (!cancelled && existingProfile && (existingProfile.categories?.length ?? 0) > 0) {
          navigate("/profesional/panel", { replace: true });
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    async function loadCatalog() {
      try {
        const [categoryList, serviceList] = await Promise.all([getCategories(), getServices()]);
        if (!cancelled) {
          setCategories(categoryList);
          setServices(serviceList);
        }
      } catch {
        if (!cancelled) setError("No fue posible cargar categorías y servicios reales.");
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    }
    void loadCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateProfile = (field: keyof ProfessionalOnboardingProfile, value: string | boolean | string[]) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const goBack = () => {
    setError("");
    setStep((current) => Math.max(0, current - 1));
  };

  const validatePhone = () => /^\d{9}$/.test(profile.phone);
  const validateCode = () => verificationCode.join("").length === 6;
  const validateEmail = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email);
  const validateArea = () => profile.province && profile.city && /^\d{5}$/.test(profile.postalCode);
  const selectedServices = services.filter((service) => profile.categoryIds.includes(service.categoryId));

  const continueFrom = (currentStep: number) => {
    if (currentStep === 1 && !validatePhone()) {
      setError("Introduce un móvil español válido de 9 cifras.");
      return;
    }
    if (currentStep === 2 && !validateCode()) {
      setError("Introduce el código de verificación de 6 cifras.");
      return;
    }
    if (currentStep === 3 && profile.fullName.trim().length < 2) {
      setError("Introduce tu nombre profesional o comercial.");
      return;
    }
    if (currentStep === 4 && !validateEmail()) {
      setError("Introduce un email válido.");
      return;
    }
    if (currentStep === 8 && !validateArea()) {
      setError("Selecciona provincia, ciudad y un código postal válido.");
      return;
    }
    if (currentStep === 8 && profile.categoryIds.length === 0) {
      setError("Selecciona al menos una categoría real.");
      return;
    }
    setError("");
    if (currentStep === 8) {
      setSaving(true);
      saveProfessionalProfile(profile);
      saveMyProfessionalProfile({
        displayName: profile.fullName,
        email: profile.email || null,
        phone: profile.phone || null,
        document: profile.document || null,
        bio: profile.shortBio || null,
        yearsExperience: Number(profile.experienceYears) || 0,
        province: profile.province,
        municipality: profile.city,
        postalCode: profile.postalCode,
        referenceAddress: profile.referenceAddress || null,
        workRadius: Number(profile.workRadius) || 25,
        availability: profile.availability || null,
        profileImageUrl: null,
        categoryIds: profile.categoryIds,
        serviceIds: profile.serviceIds.filter((serviceId) => selectedServices.some((service) => service.id === serviceId))
      })
        .then(() => {
          saveProfessionalProfilePhoto(profile.photoDataUrl);
          clearProfessionalProfileDraft();
          setSavedMessage("Perfil profesional guardado correctamente");
          navigate("/profesional/panel", { state: { message: "Perfil profesional guardado correctamente" } });
        })
        .catch(() => {
          setError("No fue posible guardar el perfil profesional. Revisa tu sesión e inténtalo de nuevo.");
        })
        .finally(() => setSaving(false));
      return;
    }
    setStep((current) => current + 1);
  };

  const handleCodeChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextCode = [...verificationCode];
    nextCode[index] = digit;
    setVerificationCode(nextCode);
    setError("");
    if (digit && index < codeRefs.current.length - 1) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateProfile("photoDataUrl", String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  const toggleCategory = (category: string) => {
    const selectedCategory = categories.find((item) => item.name === category);
    if (!selectedCategory) return;
    const exists = profile.categoryIds.includes(selectedCategory.id);
    const nextCategoryIds = exists
      ? profile.categoryIds.filter((item) => item !== selectedCategory.id)
      : [...profile.categoryIds, selectedCategory.id];
    const nextServiceIds = profile.serviceIds.filter((serviceId) => {
      const service = services.find((item) => item.id === serviceId);
      return service ? nextCategoryIds.includes(service.categoryId) : false;
    });
    setProfile((current) => ({
      ...current,
      categories: categories.filter((item) => nextCategoryIds.includes(item.id)).map((item) => item.name),
      categoryIds: nextCategoryIds,
      serviceIds: nextServiceIds
    }));
    setError("");
  };

  const toggleService = (serviceId: number) => {
    setProfile((current) => ({
      ...current,
      serviceIds: current.serviceIds.includes(serviceId)
        ? current.serviceIds.filter((item) => item !== serviceId)
        : [...current.serviceIds, serviceId]
    }));
    setError("");
  };

  return (
    <main className="pro-onboarding-shell">
      <section className="pro-onboarding-card">
        <div className="pro-step-indicator" aria-label="Progreso del registro profesional">
          {step === 0 ? "Inicio" : `Paso ${step} de 8`}
        </div>

        {step === 0 && (
          <div className="pro-welcome-layout">
            <div>
              <span className="pro-eyebrow">FixGo profesionales</span>
              <h1>Llega a más clientes en cuestión de segundos</h1>
              <p>Recibe solicitudes de reparación, instalación y mantenimiento del hogar en tu zona, con información clara para preparar presupuestos más rápido.</p>
              <button className="pro-primary-button" type="button" onClick={() => setStep(1)}>
                Empezar
                <ArrowRight size={20} />
              </button>
            </div>
            <div className="pro-welcome-card" aria-hidden="true">
              <BriefcasePreview />
            </div>
          </div>
        )}

        {step === 1 && (
          <StepFrame icon={<Phone size={24} />} title="Introduce tu móvil" onBack={goBack}>
            <label className="pro-phone-field">
              Número de móvil
              <div>
                <span>+34</span>
                <input
                  inputMode="numeric"
                  maxLength={9}
                  value={profile.phone}
                  onChange={(event) => updateProfile("phone", event.target.value.replace(/\D/g, "").slice(0, 9))}
                  placeholder="600 000 000"
                />
              </div>
            </label>
            <PrimaryContinue onClick={() => continueFrom(1)} />
          </StepFrame>
        )}

        {step === 2 && (
          <StepFrame icon={<ShieldCheck size={24} />} title="Verifica tu acceso" onBack={goBack}>
            <p className="pro-helper-text">Usa un código de 6 cifras para continuar la maqueta de verificación. No se envía SMS real ni se marca el teléfono como verificado.</p>
            <div className="pro-code-grid">
              {verificationCode.map((digit, index) => (
                <input
                  aria-label={`Dígito ${index + 1}`}
                  inputMode="numeric"
                  key={index}
                  maxLength={1}
                  ref={(element) => { codeRefs.current[index] = element; }}
                  value={digit}
                  onChange={(event) => handleCodeChange(index, event.target.value)}
                />
              ))}
            </div>
            <button className="pro-link-button" type="button" onClick={() => setVerificationCode(["", "", "", "", "", ""])}>
              Volver a enviar
            </button>
            <PrimaryContinue onClick={() => continueFrom(2)} />
          </StepFrame>
        )}

        {step === 3 && (
          <StepFrame icon={<UserRound size={24} />} title="Tu nombre profesional" onBack={goBack}>
            <label className="pro-field">
              Nombre y apellidos o nombre comercial
              <input value={profile.fullName} onChange={(event) => updateProfile("fullName", event.target.value)} placeholder="Ejemplo: Reformas García" />
            </label>
            <PrimaryContinue onClick={() => continueFrom(3)} />
          </StepFrame>
        )}

        {step === 4 && (
          <StepFrame icon={<ShieldCheck size={24} />} title="Email de contacto" onBack={goBack}>
            <label className="pro-field">
              Email
              <input type="email" value={profile.email} onChange={(event) => updateProfile("email", event.target.value)} placeholder="tuemail@ejemplo.es" />
            </label>
            <PrimaryContinue onClick={() => continueFrom(4)} />
          </StepFrame>
        )}

        {step === 5 && (
          <StepFrame icon={<ShieldCheck size={24} />} title="Documento de identidad" onBack={goBack}>
            <p className="pro-helper-text">Puedes añadir DNI, NIE o CIF ahora, o completar este dato más adelante desde tu perfil.</p>
            <label className="pro-field">
              DNI/NIE/CIF opcional
              <input value={profile.document} onChange={(event) => updateProfile("document", event.target.value.toUpperCase())} placeholder="Documento opcional" />
            </label>
            <div className="pro-action-row">
              <button className="pro-primary-button" type="button" onClick={() => continueFrom(5)}>Crear cuenta</button>
              <button className="pro-secondary-button" type="button" onClick={() => { updateProfile("document", ""); setStep(6); }}>Saltar paso y crear cuenta</button>
            </div>
          </StepFrame>
        )}

        {step === 6 && (
          <StepFrame icon={<CheckCircle2 size={24} />} title="Términos y condiciones" onBack={goBack}>
            <div className="pro-terms-box">
              <strong>Condiciones de uso profesional</strong>
              <p>FixGo mostrará tus datos profesionales a clientes cuando exista una solicitud compatible. Debes mantener información veraz y responder con presupuestos claros.</p>
            </div>
            <button className="pro-primary-button" type="button" onClick={() => { updateProfile("termsAccepted", true); setStep(7); }}>
              He leído y acepto
            </button>
          </StepFrame>
        )}

        {step === 7 && (
          <StepFrame icon={<Camera size={24} />} title="Foto de perfil" onBack={goBack}>
            <div className="pro-photo-step">
              <div className="pro-avatar extra-large">
                {profile.photoDataUrl ? <img src={profile.photoDataUrl} alt="" /> : <span>{(profile.fullName || "FG").slice(0, 2).toUpperCase()}</span>}
              </div>
              <label className="pro-upload-button">
                Subir foto
                <input accept="image/*" type="file" onChange={handlePhoto} />
              </label>
            </div>
            <div className="pro-action-row">
              <button className="pro-primary-button" type="button" onClick={() => setStep(8)}>Continuar</button>
              <button className="pro-secondary-button" type="button" onClick={() => { updateProfile("photoDataUrl", ""); setStep(8); }}>Continuar sin foto</button>
            </div>
          </StepFrame>
        )}

        {step === 8 && (
          <StepFrame icon={<MapPin size={24} />} title="Zona de trabajo" onBack={goBack}>
            <div className="pro-form-grid compact">
              <label>
                Provincia
                <select
                  value={profile.province}
                  onChange={(event) => {
                    const province = event.target.value;
                    const area = spanishWorkAreas.find((item) => item.province === province) ?? spanishWorkAreas[0];
                    setProfile((current) => ({ ...current, province, city: area.cities[0] }));
                    setError("");
                  }}
                >
                  {spanishWorkAreas.map((area) => <option key={area.province}>{area.province}</option>)}
                </select>
              </label>
              <label>
                Ciudad o municipio
                <select value={profile.city} onChange={(event) => updateProfile("city", event.target.value)}>
                  {selectedProvince.cities.map((city) => <option key={city}>{city}</option>)}
                </select>
              </label>
              <label>
                Código postal
                <input inputMode="numeric" value={profile.postalCode} onChange={(event) => updateProfile("postalCode", event.target.value.replace(/\D/g, "").slice(0, 5))} />
              </label>
              <label>
                Dirección de referencia opcional
                <input value={profile.referenceAddress} onChange={(event) => updateProfile("referenceAddress", event.target.value)} />
              </label>
              <label>
                Radio de trabajo
                <select value={profile.workRadius} onChange={(event) => updateProfile("workRadius", event.target.value)}>
                  <option value="10">10 km</option>
                  <option value="25">25 km</option>
                  <option value="50">50 km</option>
                  <option value="75">75 km</option>
                </select>
              </label>
            </div>
            <fieldset className="pro-category-fieldset compact">
              <legend>Especialidades iniciales</legend>
              {catalogLoading && <p className="pro-helper-text">Cargando categorías reales...</p>}
              <div>
                {categories.map((category) => (
                  <label key={category.id}>
                    <input checked={profile.categoryIds.includes(category.id)} type="checkbox" onChange={() => toggleCategory(category.name)} />
                    {category.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="pro-category-fieldset compact">
              <legend>Servicios específicos</legend>
              <div>
                {selectedServices.map((service) => (
                  <label key={service.id}>
                    <input checked={profile.serviceIds.includes(service.id)} type="checkbox" onChange={() => toggleService(service.id)} />
                    {service.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <PrimaryContinue label={saving ? "Guardando perfil..." : "Continuar al panel"} onClick={() => { if (!saving) continueFrom(8); }} />
          </StepFrame>
        )}

        {error && <p className="pro-form-error" role="alert">{error}</p>}
        {savedMessage && <p className="pro-form-success" aria-live="polite">{savedMessage}</p>}
        <Link className="pro-back-home" to="/">
          <ArrowLeft size={18} />
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}

function StepFrame({ children, icon, onBack, title }: { children: ReactNode; icon: ReactNode; onBack: () => void; title: string }) {
  return (
    <div className="pro-step">
      <button className="pro-link-button back" type="button" onClick={onBack}>
        <ArrowLeft size={18} />
        Volver
      </button>
      <div className="pro-step-title">
        <span>{icon}</span>
        <h1>{title}</h1>
      </div>
      {children}
    </div>
  );
}

function PrimaryContinue({ label = "Continuar", onClick }: { label?: string; onClick: () => void }) {
  return (
    <button className="pro-primary-button wide" type="button" onClick={onClick}>
      {label}
      <ArrowRight size={20} />
    </button>
  );
}

function BriefcasePreview() {
  return (
    <>
      <div className="pro-preview-row"><span>Nueva solicitud</span><strong>Fontanería</strong></div>
      <div className="pro-preview-main">Reparación urgente en tu zona</div>
      <div className="pro-preview-grid">
        <span><MapPin size={15} /> Madrid</span>
        <span><Clock size={15} /> Alta</span>
        <span><Euro size={15} /> 80 - 180</span>
      </div>
      <div className="pro-preview-avatars" aria-hidden="true">
        <i /><i /><i />
        <small>+120 clientes buscan profesionales hoy</small>
      </div>
    </>
  );
}
