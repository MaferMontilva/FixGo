import type { ProfessionalOnboardingProfile } from "../types/professionalOnboarding";

export const professionalCategories = [
  "Fontanería",
  "Electricidad",
  "Cerrajería",
  "Climatización",
  "Manitas",
  "Montaje de muebles",
  "Limpieza",
  "Antenas y televisión"
];

export const spanishWorkAreas = [
  {
    province: "Madrid",
    cities: ["Madrid", "Alcalá de Henares", "Getafe", "Leganés", "Móstoles"]
  },
  {
    province: "Barcelona",
    cities: ["Barcelona", "Badalona", "Hospitalet de Llobregat", "Sabadell", "Terrassa"]
  },
  {
    province: "Valencia",
    cities: ["Valencia", "Torrent", "Paterna", "Gandía", "Sagunto"]
  },
  {
    province: "Sevilla",
    cities: ["Sevilla", "Dos Hermanas", "Alcalá de Guadaíra", "Utrera", "Écija"]
  },
  {
    province: "Málaga",
    cities: ["Málaga", "Marbella", "Mijas", "Fuengirola", "Estepona"]
  }
];

export const emptyProfessionalProfile: ProfessionalOnboardingProfile = {
  availability: "Laborables",
  categories: ["Fontanería", "Manitas"],
  categoryIds: [],
  city: "Madrid",
  document: "",
  email: "",
  experienceYears: "5",
  fullName: "",
  phone: "",
  photoDataUrl: "",
  postalCode: "",
  profileStatus: "incomplete",
  province: "Madrid",
  referenceAddress: "",
  shortBio: "Atiendo reparaciones del hogar, mantenimientos y pequeños montajes con respuesta rápida.",
  serviceIds: [],
  termsAccepted: false,
  workRadius: "25"
};

export const professionalNotifications = [
  {
    title: "Nueva solicitud compatible",
    text: "Hay una reparación urgente cerca de tu zona de trabajo.",
    meta: "Hace 8 min"
  },
  {
    title: "Perfil actualizado",
    text: "Tu zona de trabajo y especialidades están listas para revisión.",
    meta: "Hoy"
  },
  {
    title: "Recordatorio",
    text: "Completa tu documento si quieres acelerar la validación del perfil.",
    meta: "Pendiente"
  }
];

export const professionalRequestMarketplace = [
  {
    id: 1042,
    title: "Reparar fuga bajo fregadero",
    category: "Fontanería",
    service: "Fuga de agua",
    location: "Madrid, Chamberí",
    urgency: "Alta",
    price: "80 EUR - 180 EUR",
    date: "Hoy",
    status: "Nueva",
    description: "Necesito reparar una fuga bajo el fregadero de la cocina. El agua cae al abrir el grifo."
  },
  {
    id: 1043,
    title: "Montaje de muebles de cocina",
    category: "Manitas",
    service: "Montaje",
    location: "Madrid, Retiro",
    urgency: "Normal",
    price: "120 EUR - 260 EUR",
    date: "Mañana",
    status: "Compatible",
    description: "Necesito realizar el montaje de varios muebles de cocina y revisar si deben fijarse a la pared."
  },
  {
    id: 1044,
    title: "Televisor sin señal",
    category: "Antenas y televisión",
    service: "Diagnóstico",
    location: "Alcalá de Henares",
    urgency: "Normal",
    price: "45 EUR - 120 EUR",
    date: "Esta semana",
    status: "Nueva",
    description: "El televisor no recibe señal desde ayer. Necesito revisar la toma y la antena comunitaria."
  }
];
