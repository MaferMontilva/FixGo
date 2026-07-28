import { BriefcaseBusiness, Camera, CheckCircle2, MapPin, Save, Star } from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../../categories";
import type { UiCategory } from "../../categories";
import { getServices } from "../../services";
import type { ApiService } from "../../services";
import { emptyProfessionalProfile, spanishWorkAreas } from "../data/professionalOnboardingData";
import { getMyProfessionalProfile, saveMyProfessionalProfile } from "../services/professionalsApi";
import { loadProfessionalProfilePhoto, saveProfessionalProfilePhoto } from "../storage/professionalOnboardingStorage";
import type { ProfessionalOnboardingProfile, ProfessionalProfileApi } from "../types/professionalOnboarding";
import { ProfessionalNav } from "../components/ProfessionalNav";

const BUSINESS_NAME_REGEX = /^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ.,&' -]+$/;
const PLACE_NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
const PHONE_REGEX = /^\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POSTAL_CODE_REGEX = /^(0[1-9]|[1-4]\d|5[0-2])\d{3}$/;

type ProfessionalProfileErrors = {
  fullName?: string;
  phone?: string;
  email?: string;
  shortBio?: string;
  province?: string;
  city?: string;
  postalCode?: string;
  referenceAddress?: string;
  experienceYears?: string;
};

function initials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "FG";
}

function mapApiProfile(profile: ProfessionalProfileApi | null): ProfessionalOnboardingProfile {
  if (!profile) return emptyProfessionalProfile;
  return {
    ...emptyProfessionalProfile,
    availability: profile.availability ?? "Laborables",
    categories: profile.categories.map((category) => category.name),
    categoryIds: profile.categories.map((category) => category.id),
    city: profile.municipality ?? "",
    document: profile.document ?? "",
    email: profile.email ?? "",
    experienceYears: String(profile.yearsExperience ?? 0),
    fullName: profile.displayName,
    phone: profile.phone ?? "",
    photoDataUrl: "",
    postalCode: profile.postalCode ?? "",
    profileStatus: profile.status === "ACTIVE" ? "active" : profile.status === "SUSPENDED" ? "incomplete" : "incomplete",
    province: profile.province ?? "Madrid",
    referenceAddress: profile.referenceAddress ?? "",
    shortBio: profile.bio ?? "",
    serviceIds: profile.services.map((service) => service.id),
    termsAccepted: true,
    workRadius: String(profile.workRadius ?? 25)
  };
}

export function ProfessionalProfilePage() {
  const [profile, setProfile] = useState<ProfessionalOnboardingProfile>(emptyProfessionalProfile);
  const [categories, setCategories] = useState<UiCategory[]>([]);
  const [services, setServices] = useState<ApiService[]>([]);
  const [photoPreview, setPhotoPreview] = useState("");
  const [rating, setRating] = useState({ average: 0, count: 0 });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ProfessionalProfileErrors>({});
  const selectedProvince = useMemo(
    () => spanishWorkAreas.find((area) => area.province === profile.province) ?? spanishWorkAreas[0],
    [profile.province]
  );
  const availableServices = services.filter((service) => profile.categoryIds.includes(service.categoryId));

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      try {
        const [profileResult, categoryList, serviceList] = await Promise.all([
          getMyProfessionalProfile(),
          getCategories(),
          getServices()
        ]);
        if (!cancelled) {
          setProfile(mapApiProfile(profileResult));
          setPhotoPreview(profileResult?.profileImageUrl ?? "");
          setRating({ average: profileResult?.ratingAverage ?? 0, count: profileResult?.ratingsCount ?? 0 });
          setCategories(categoryList);
          setServices(serviceList);
        }
      } catch {
        if (!cancelled) setError("No fue posible cargar tu perfil profesional.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateField = (field: keyof ProfessionalOnboardingProfile, value: string) => {
    setSaved(false);
    setError("");
    setFieldErrors((current) => {
      const key = field as keyof ProfessionalProfileErrors;
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const toggleCategory = (category: UiCategory) => {
    setSaved(false);
    setProfile((current) => {
      const exists = current.categoryIds.includes(category.id);
      const categoryIds = exists ? current.categoryIds.filter((id) => id !== category.id) : [...current.categoryIds, category.id];
      return {
        ...current,
        categoryIds,
        categories: categories.filter((item) => categoryIds.includes(item.id)).map((item) => item.name),
        serviceIds: current.serviceIds.filter((serviceId) => {
          const service = services.find((item) => item.id === serviceId);
          return service ? categoryIds.includes(service.categoryId) : false;
        })
      };
    });
  };

  const toggleService = (serviceId: number) => {
    setSaved(false);
    setProfile((current) => ({
      ...current,
      serviceIds: current.serviceIds.includes(serviceId)
        ? current.serviceIds.filter((id) => id !== serviceId)
        : [...current.serviceIds, serviceId]
    }));
  };

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const nextErrors: ProfessionalProfileErrors = {};
    const trimmedFullName = profile.fullName.trim();
    const trimmedPhone = profile.phone.trim();
    const trimmedEmail = profile.email.trim();
    const trimmedBio = profile.shortBio.trim();
    const trimmedProvince = profile.province.trim();
    const trimmedCity = profile.city.trim();
    const trimmedPostalCode = profile.postalCode.trim();
    const trimmedReferenceAddress = profile.referenceAddress.trim();

    if (trimmedFullName.length < 2 || trimmedFullName.length > 120) {
      nextErrors.fullName = "El nombre debe tener entre 2 y 120 caracteres.";
    } else if (!BUSINESS_NAME_REGEX.test(trimmedFullName)) {
      nextErrors.fullName = "El nombre contiene caracteres no permitidos.";
    }

    if (trimmedPhone && !PHONE_REGEX.test(trimmedPhone)) {
      nextErrors.phone = "Escribe un telefono valido (9 digitos).";
    }

    if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
      nextErrors.email = "Escribe un correo electronico valido.";
    }

    if (trimmedBio.length > 1000) {
      nextErrors.shortBio = "La biografia no puede superar los 1000 caracteres.";
    }

    if (trimmedProvince.length < 2 || trimmedProvince.length > 80 || !PLACE_NAME_REGEX.test(trimmedProvince)) {
      nextErrors.province = "La provincia solo puede contener letras.";
    }

    if (trimmedCity.length < 2 || trimmedCity.length > 80 || !PLACE_NAME_REGEX.test(trimmedCity)) {
      nextErrors.city = "El municipio solo puede contener letras.";
    }

    if (!POSTAL_CODE_REGEX.test(trimmedPostalCode)) {
      nextErrors.postalCode = "Escribe un codigo postal valido.";
    }

    if (trimmedReferenceAddress.length > 200) {
      nextErrors.referenceAddress = "La direccion no puede superar los 200 caracteres.";
    }

    const experienceYears = Number(profile.experienceYears);
    if (!Number.isFinite(experienceYears) || experienceYears < 0 || experienceYears > 70) {
      nextErrors.experienceYears = "Los anios de experiencia deben estar entre 0 y 70.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!validate()) {
      setError("Revisa los campos marcados antes de guardar.");
      return;
    }

    setSaving(true);
    try {
      await saveMyProfessionalProfile({
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
        profileImageUrl: photoPreview || null,
        categoryIds: profile.categoryIds,
        serviceIds: profile.serviceIds
      });
      saveProfessionalProfilePhoto(photoPreview);
      setSaved(true);
    } catch {
      setError("No fue posible guardar tu perfil profesional.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="pro-dashboard-shell">
      <ProfessionalNav />
      <form className="pro-panel pro-profile-form" onSubmit={handleSubmit}>
        <div className="pro-profile-cover" aria-hidden="true"></div>
        <div className="pro-profile-identity">
          <label className="pro-profile-avatar">
            <span className="pro-avatar-inner">
              {photoPreview ? <img src={photoPreview} alt="Foto de perfil" /> : <span className="pro-avatar-initials">{initials(profile.fullName)}</span>}
            </span>
            <span className="pro-avatar-cam" aria-hidden="true"><Camera size={16} /></span>
            <input accept="image/*" type="file" onChange={handlePhoto} />
          </label>
          <div className="pro-identity-text">
            <div className="pro-identity-name">
              <h1>{profile.fullName || "Tu nombre profesional"}</h1>
              <span className={`pro-status-badge is-${profile.profileStatus}`}>
                {profile.profileStatus === "active" ? "Activo" : "Incompleto"}
              </span>
            </div>
            <p className="pro-identity-sub">
              {[profile.categories.join(" · "), [profile.city, profile.province].filter(Boolean).join(", ")].filter(Boolean).join(" · ") || "Completa tu perfil para recibir solicitudes"}
            </p>
            <div className="pro-identity-meta">
              <span className="pro-stars-inline">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={15} className={n <= Math.round(rating.average) ? "is-filled" : ""} />
                ))}
                <span className="pro-rating-num">
                  {rating.average.toFixed(1)}
                  {rating.count > 0 ? ` · ${rating.count} reseñas` : " · Sin reseñas"}
                </span>
              </span>
              <span className="pro-meta-item"><BriefcaseBusiness size={15} /> {profile.experienceYears || 0} años de experiencia</span>
              <span className="pro-meta-item"><MapPin size={15} /> Radio {profile.workRadius} km</span>
            </div>
          </div>
        </div>
        {error && <p className="pro-page-error" role="alert">{error}</p>}

        <div className="pro-form-section">
          <h2 className="pro-form-section-title">Datos de contacto</h2>
        <div className="pro-form-grid">
          <label>Nombre profesional o comercial<input value={profile.fullName} onChange={(event) => updateField("fullName", event.target.value)} />{fieldErrors.fullName ? <span className="field-error" role="alert">{fieldErrors.fullName}</span> : null}</label>
          <label>Teléfono<input value={profile.phone} onChange={(event) => updateField("phone", event.target.value.replace(/\D/g, "").slice(0, 9))} />{fieldErrors.phone ? <span className="field-error" role="alert">{fieldErrors.phone}</span> : null}</label>
          <label>Email<input type="email" value={profile.email} onChange={(event) => updateField("email", event.target.value)} />{fieldErrors.email ? <span className="field-error" role="alert">{fieldErrors.email}</span> : null}</label>
          <label>Documento opcional<input value={profile.document} onChange={(event) => updateField("document", event.target.value.toUpperCase())} /></label>
        </div>
        </div>

        <div className="pro-form-section">
          <h2 className="pro-form-section-title">Sobre ti</h2>
        <div className="pro-form-grid">
          <label>Años de experiencia<input min="0" max="70" type="number" value={profile.experienceYears} onChange={(event) => updateField("experienceYears", event.target.value)} />{fieldErrors.experienceYears ? <span className="field-error" role="alert">{fieldErrors.experienceYears}</span> : null}</label>
          <label>Disponibilidad<select value={profile.availability} onChange={(event) => updateField("availability", event.target.value)}><option>Laborables</option><option>Fines de semana</option><option>Urgencias 24 h</option><option>Mañanas</option><option>Tardes</option></select></label>
          <label className="pro-form-wide">Descripción breve<textarea value={profile.shortBio} onChange={(event) => updateField("shortBio", event.target.value)} rows={4} maxLength={1000} />{fieldErrors.shortBio ? <span className="field-error" role="alert">{fieldErrors.shortBio}</span> : null}</label>
        </div>
        </div>

        <div className="pro-form-section">
          <h2 className="pro-form-section-title">Zona de trabajo</h2>
        <div className="pro-form-grid">
          <label>Provincia<select value={profile.province} onChange={(event) => { const province = event.target.value; const area = spanishWorkAreas.find((item) => item.province === province) ?? spanishWorkAreas[0]; setProfile((current) => ({ ...current, province, city: area.cities[0] })); setFieldErrors((current) => ({ ...current, province: undefined, city: undefined })); setSaved(false); }}>{spanishWorkAreas.map((area) => <option key={area.province}>{area.province}</option>)}</select>{fieldErrors.province ? <span className="field-error" role="alert">{fieldErrors.province}</span> : null}</label>
          <label>Ciudad o municipio<input value={profile.city} onChange={(event) => updateField("city", event.target.value)} list="professional-cities" /><datalist id="professional-cities">{selectedProvince.cities.map((city) => <option key={city}>{city}</option>)}</datalist>{fieldErrors.city ? <span className="field-error" role="alert">{fieldErrors.city}</span> : null}</label>
          <label>Código postal<input value={profile.postalCode} onChange={(event) => updateField("postalCode", event.target.value.replace(/\D/g, "").slice(0, 5))} />{fieldErrors.postalCode ? <span className="field-error" role="alert">{fieldErrors.postalCode}</span> : null}</label>
          <label>Radio de trabajo<select value={profile.workRadius} onChange={(event) => updateField("workRadius", event.target.value)}><option value="10">10 km</option><option value="25">25 km</option><option value="50">50 km</option><option value="75">75 km</option></select></label>
          <label className="pro-form-wide">Dirección de referencia opcional<input value={profile.referenceAddress} onChange={(event) => updateField("referenceAddress", event.target.value)} maxLength={200} />{fieldErrors.referenceAddress ? <span className="field-error" role="alert">{fieldErrors.referenceAddress}</span> : null}</label>
        </div>
        </div>

        <div className="pro-form-section">
          <h2 className="pro-form-section-title">Especialidades</h2>
        <fieldset className="pro-category-fieldset">
          <legend>Categorías en las que trabajas</legend>
          <div>{categories.map((category) => <label key={category.id}><input checked={profile.categoryIds.includes(category.id)} type="checkbox" onChange={() => toggleCategory(category)} />{category.name}</label>)}</div>
        </fieldset>

        <fieldset className="pro-category-fieldset">
          <legend>Servicios específicos</legend>
          {availableServices.length ? (
            <div>{availableServices.map((service) => <label key={service.id}><input checked={profile.serviceIds.includes(service.id)} type="checkbox" onChange={() => toggleService(service.id)} />{service.name}</label>)}</div>
          ) : (
            <p className="pro-fieldset-empty">Aún no hay servicios específicos para tus categorías. Puedes dejar este apartado vacío; recibirás oportunidades por categoría.</p>
          )}
        </fieldset>
        </div>

        <div className="pro-status-row" aria-live="polite">
          {saved ? (
            <span className="pro-saved-ok"><CheckCircle2 size={18} /> Perfil guardado correctamente</span>
          ) : (
            <span>Estado del perfil: <strong className={`pro-status-badge is-${profile.profileStatus}`}>{profile.profileStatus === "active" ? "Activo" : "Incompleto"}</strong></span>
          )}
        </div>

        <div className="pro-form-actions">
          <button className="pro-primary-button" type="submit" disabled={saving}><Save size={18} />{saving ? "Guardando..." : "Guardar perfil"}</button>
          <Link className="pro-secondary-button" to="/profesional/panel">Volver al panel</Link>
        </div>
      </form>
    </main>
  );
}
