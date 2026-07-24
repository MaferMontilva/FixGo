export function getDescriptionError(description: string) {
  const trimmedDescription = description.trim();

  if (!trimmedDescription) {
    return "Describe brevemente el trabajo que necesitas.";
  }

  if (trimmedDescription.length < 15) {
    return "Añade un poco más de información para que los profesionales puedan entender el trabajo.";
  }

  return "";
}
