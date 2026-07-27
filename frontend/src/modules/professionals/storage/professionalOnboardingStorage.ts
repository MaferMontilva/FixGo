import { emptyProfessionalProfile } from "../data/professionalOnboardingData";
import type { ProfessionalOnboardingProfile } from "../types/professionalOnboarding";

const STORAGE_KEY = "fixgo-professional-onboarding-profile";
const PHOTO_STORAGE_KEY = "fixgo-professional-profile-photo";

export function loadProfessionalProfile(): ProfessionalOnboardingProfile {
  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) return emptyProfessionalProfile;

  try {
    return {
      ...emptyProfessionalProfile,
      ...(JSON.parse(rawValue) as Partial<ProfessionalOnboardingProfile>)
    };
  } catch {
    return emptyProfessionalProfile;
  }
}

export function saveProfessionalProfile(profile: ProfessionalOnboardingProfile) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function clearProfessionalProfileDraft() {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function loadProfessionalProfilePhoto() {
  return window.localStorage.getItem(PHOTO_STORAGE_KEY) ?? "";
}

export function saveProfessionalProfilePhoto(photoDataUrl: string) {
  if (photoDataUrl) {
    window.localStorage.setItem(PHOTO_STORAGE_KEY, photoDataUrl);
  }
}
