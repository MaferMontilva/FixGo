import { Camera, CheckCircle2, Save, UserRound } from "lucide-react";
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
  const [photoPreview, setPhotoPreview] = useState(() => loadProfessionalProfilePhoto());
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
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
        profileImageUrl: null,
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
        <div className="pro-section-title">
          <UserRound size={24} />
          <div>
            <h1>Editar perfil profesional</h1>
            <p>{loading ? "Cargando datos reales del perfil..." : "Mantén visibles tus datos principales para recibir solicitudes compatibles."}</p>
          </div>
        </div>
        {error && <p className="pro-page-error" role="alert">{error}</p>}

        <div className="pro-profile-editor-head">
          <div className="pro-avatar extra-large">
            {photoPreview ? <img src={photoPreview} alt="" /> : <span>{initials(profile.fullName)}</span>}
          </div>
          <label className="pro-upload-button">
            <Camera size={18} />
            Cambiar foto
            <input accept="image/*" type="file" onChange={handlePhoto} />
          </label>
        </div>

        <div className="pro-form-grid">
          <label>Nombre profesional o comercial<input value={profile.fullName} onChange={(event) => updateField("fullName", event.target.value)} /></label>
          <label>Teléfono<input value={profile.phone} onChange={(event) => updateField("phone", event.target.value.replace(/\D/g, "").slice(0, 9))} /></label>
          <label>Email<input type="email" value={profile.email} onChange={(event) => updateField("email", event.target.value)} /></label>
          <label>Documento opcional<input value={profile.document} onChange={(event) => updateField("document", event.target.value.toUpperCase())} /></label>
          <label>Años de experiencia<input min="0" type="number" value={profile.experienceYears} onChange={(event) => updateField("experienceYears", event.target.value)} /></label>
          <label>Disponibilidad<select value={profile.availability} onChange={(event) => updateField("availability", event.target.value)}><option>Laborables</option><option>Fines de semana</option><option>Urgencias 24 h</option><option>Mañanas</option><option>Tardes</option></select></label>
          <label className="pro-form-wide">Descripción breve<textarea value={profile.shortBio} onChange={(event) => updateField("shortBio", event.target.value)} rows={4} /></label>
          <label>Provincia<select value={profile.province} onChange={(event) => { const province = event.target.value; const area = spanishWorkAreas.find((item) => item.province === province) ?? spanishWorkAreas[0]; setProfile((current) => ({ ...current, province, city: area.cities[0] })); setSaved(false); }}>{spanishWorkAreas.map((area) => <option key={area.province}>{area.province}</option>)}</select></label>
          <label>Ciudad o municipio<input value={profile.city} onChange={(event) => updateField("city", event.target.value)} list="professional-cities" /><datalist id="professional-cities">{selectedProvince.cities.map((city) => <option key={city}>{city}</option>)}</datalist></label>
          <label>Código postal<input value={profile.postalCode} onChange={(event) => updateField("postalCode", event.target.value.replace(/\D/g, "").slice(0, 5))} /></label>
          <label>Radio de trabajo<select value={profile.workRadius} onChange={(event) => updateField("workRadius", event.target.value)}><option value="10">10 km</option><option value="25">25 km</option><option value="50">50 km</option><option value="75">75 km</option></select></label>
          <label className="pro-form-wide">Dirección de referencia opcional<input value={profile.referenceAddress} onChange={(event) => updateField("referenceAddress", event.target.value)} /></label>
        </div>

        <fieldset className="pro-category-fieldset">
          <legend>Categorías reales en las que trabaja</legend>
          <div>{categories.map((category) => <label key={category.id}><input checked={profile.categoryIds.includes(category.id)} type="checkbox" onChange={() => toggleCategory(category)} />{category.name}</label>)}</div>
        </fieldset>

        <fieldset className="pro-category-fieldset">
          <legend>Servicios específicos</legend>
          <div>{availableServices.map((service) => <label key={service.id}><input checked={profile.serviceIds.includes(service.id)} type="checkbox" onChange={() => toggleService(service.id)} />{service.name}</label>)}</div>
        </fieldset>

        <div className="pro-status-row" aria-live="polite">
          {saved ? <span><CheckCircle2 size={18} /> Perfil guardado correctamente</span> : <span>Estado del perfil: {profile.profileStatus}</span>}
        </div>

        <div className="pro-form-actions">
          <button className="pro-primary-button" type="submit" disabled={saving}><Save size={18} />{saving ? "Guardando..." : "Guardar perfil"}</button>
          <Link className="pro-secondary-button" to="/profesional/panel">Volver al panel</Link>
        </div>
      </form>
    </main>
  );
}
