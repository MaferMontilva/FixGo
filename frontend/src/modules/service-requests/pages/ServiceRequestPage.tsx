import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth";
import { fallbackCategories, getCategories } from "../../categories";
import type { UiCategory } from "../../categories";
import { getServices } from "../../services";
import type { ApiService } from "../../services";
import { CategoryServiceStep } from "../components/CategoryServiceStep";
import { DescriptionStep } from "../components/DescriptionStep";
import { RequestDraftNotice } from "../components/RequestDraftNotice";
import { RequestSubmissionActions } from "../components/RequestSubmissionActions";
import { RequestSubmissionResult } from "../components/RequestSubmissionResult";
import { RequestStepActions } from "../components/RequestStepActions";
import { RequestStepIndicator } from "../components/RequestStepIndicator";
import { ReviewStep } from "../components/ReviewStep";
import { WorkDetailsStep } from "../components/WorkDetailsStep";
import { analyzeServiceRequestWithAi, refineServiceRequestDescriptionWithAi } from "../services/serviceRequestAiApi";
import {
  createServiceRequestDraft,
  getMyServiceRequestDraftDetail,
  publishServiceRequestDraft,
  updateServiceRequestDraft
} from "../services/serviceRequestsApi";
import {
  loadServiceRequestDraftResult,
  removeServiceRequestDraft,
  saveServiceRequestDraft
} from "../storage/serviceRequestDraftStorage";
import type {
  AiAnalysisStatus,
  RequestSubmissionStatus,
  ServiceRequestAiAnalysis,
  ServiceRequestDraft,
  ServiceRequestDraftPayload,
  ServiceRequestResponse
} from "../types/serviceRequest";
import { getDescriptionError, getWorkDetailsErrors } from "../validation/serviceRequestValidation";
import type { WorkDetailsValidationErrors } from "../validation/serviceRequestValidation";
import type { ApiError } from "../../../shared/types/apiError";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function isApiError(error: unknown): error is ApiError {
  return typeof error === "object" && error !== null && "status" in error;
}

function getSubmissionErrorMessage(error: unknown) {
  if (isApiError(error)) {
    if (error.status === 400) return "Revisa los datos de la solicitud.";
    if (error.status === 401) return "Tu sesión ha caducado. Inicia sesión nuevamente.";
    if (error.status === 403) return "No tienes permisos para realizar esta acción.";
    if (error.status === 404) return "No encontramos el borrador solicitado.";
    if (error.status === 409) return "La solicitud ya fue publicada o cambió de estado.";
  }

  return "No se pudo conectar con FixGo. Inténtalo nuevamente.";
}

function buildSearchParams(categorySlug: string, serviceSlug: string) {
  const params = new URLSearchParams();

  if (categorySlug) params.set("category", categorySlug);
  if (categorySlug && serviceSlug) params.set("service", serviceSlug);

  return params;
}

function getNowIso() {
  return new Date().toISOString();
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isValidPriceRange(min: number | null | undefined, max: number | null | undefined) {
  return typeof min === "number" && typeof max === "number" && Number.isFinite(min) && Number.isFinite(max) && min > 0 && max > 0 && min <= max;
}

const validUrgencies = new Set(["LOW", "NORMAL", "HIGH", "EMERGENCY"]);
type AiHighlightedField = "title" | "description" | "category" | "service" | "urgency" | "price";
type AiFormSnapshot = {
  aiAssisted: boolean;
  budgetMax: number | null;
  budgetMin: number | null;
  categoryId: number | null;
  categorySlug: string;
  description: string;
  serviceId: number | null;
  serviceSlug: string;
  title: string;
  urgency: ServiceRequestDraft["urgency"];
};

function buildAiAnalysisKey(analysis: ServiceRequestAiAnalysis | null) {
  if (!analysis) return "";

  return JSON.stringify({
    budgetMax: analysis.suggestedBudgetRange.max,
    budgetMin: analysis.suggestedBudgetRange.min,
    categoryId: analysis.suggestedCategoryId,
    description: analysis.improvedDescription.trim(),
    serviceId: analysis.suggestedServiceId,
    title: analysis.suggestedTitle.trim(),
    urgency: analysis.suggestedUrgency
  });
}

function normalizeDetails(value: string) {
  return normalizeText(value).replace(/\s+/g, " ").trim();
}

function buildLocationDescription(locationDescription: string, postalCode: string) {
  const trimmedLocation = locationDescription.trim();
  const trimmedPostalCode = postalCode.trim();
  if (!trimmedPostalCode) return trimmedLocation;
  return `${trimmedLocation} (${trimmedPostalCode})`;
}

function descriptionMentionsDifferentCategory(description: string, currentCategoryId: number, categories: UiCategory[], services: ApiService[]) {
  const normalizedDescription = normalizeText(description);
  if (!normalizedDescription) return false;

  const differentCategoryNames = categories
    .filter((category) => category.active && category.id !== currentCategoryId)
    .map((category) => normalizeText(category.name))
    .filter((name) => name.length > 3);
  const differentServiceNames = services
    .filter((service) => service.categoryId !== currentCategoryId)
    .map((service) => normalizeText(service.name))
    .filter((name) => name.length > 3);

  return [...differentCategoryNames, ...differentServiceNames].some((name) => normalizedDescription.includes(name));
}

function createEmptyDraft(categorySlug = "", serviceSlug = ""): ServiceRequestDraft {
  return {
    aiAssisted: false,
    budgetMax: null,
    budgetMin: null,
    categoryId: null,
    categorySlug,
    currentStep: 1,
    flexibleSchedule: true,
    locationDescription: "",
    originalDescription: "",
    preferredDateFrom: "",
    preferredDateTo: "",
    postalCode: "",
    serverDraftId: null,
    serviceId: null,
    serviceSlug,
    title: "",
    updatedAt: getNowIso(),
    urgency: "NORMAL"
  };
}

function mergeStoredDraft(storedDraft: ServiceRequestDraft | null, categoryParam: string, serviceParam: string) {
  return {
    ...(storedDraft ?? createEmptyDraft()),
    categorySlug: categoryParam || storedDraft?.categorySlug || "",
    serviceSlug: serviceParam || storedDraft?.serviceSlug || "",
    updatedAt: storedDraft?.updatedAt || getNowIso()
  };
}

function hasDraftContent(draft: ServiceRequestDraft) {
  return Boolean(
    draft.categoryId ||
      draft.categorySlug ||
      draft.serviceId ||
      draft.serviceSlug ||
      draft.title.trim() ||
      draft.originalDescription.trim() ||
      draft.locationDescription.trim() ||
      draft.postalCode.trim() ||
      draft.preferredDateFrom ||
      draft.preferredDateTo ||
      draft.budgetMin ||
      draft.budgetMax ||
      draft.serverDraftId ||
      draft.currentStep > 1
  );
}

function formatSavedAt(savedAt: string) {
  if (!savedAt) return "";

  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) return "";

  return `Guardado el ${date.toLocaleString("es-ES", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric"
  })}`;
}

export function ServiceRequestPage() {
  const navigate = useNavigate();
  const { initializing, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") ?? "";
  const serviceParam = searchParams.get("service") ?? "";
  const draftIdParam = searchParams.get("draftId") ?? "";
  const [draftLoadResult] = useState(() => loadServiceRequestDraftResult());
  const storedDraft = draftLoadResult.storedDraft;

  const [categories, setCategories] = useState<UiCategory[]>(fallbackCategories);
  const [categoriesError, setCategoriesError] = useState("");
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesReloadKey, setCategoriesReloadKey] = useState(0);
  const [categoryStepFocusSignal, setCategoryStepFocusSignal] = useState(0);
  const [serviceScrollSignal, setServiceScrollSignal] = useState(0);
  const [services, setServices] = useState<ApiService[]>([]);
  const [servicesError, setServicesError] = useState("");
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesReloadKey, setServicesReloadKey] = useState(0);
  const [descriptionError, setDescriptionError] = useState("");
  const [descriptionFocusSignal, setDescriptionFocusSignal] = useState(0);
  const [aiAnalysisStatus, setAiAnalysisStatus] = useState<AiAnalysisStatus>("idle");
  const [aiAnalysis, setAiAnalysis] = useState<ServiceRequestAiAnalysis | null>(null);
  const [aiAnalysisStale, setAiAnalysisStale] = useState(false);
  const [appliedAiAnalysisKey, setAppliedAiAnalysisKey] = useState("");
  const [aiHighlightedFields, setAiHighlightedFields] = useState<AiHighlightedField[]>([]);
  const [aiPanelMessage, setAiPanelMessage] = useState("");
  const [detailsProviderMessage, setDetailsProviderMessage] = useState("");
  const [detailsStatus, setDetailsStatus] = useState<"idle" | "refining">("idle");
  const [lastIntegratedDetails, setLastIntegratedDetails] = useState("");
  const [originalFormSnapshot, setOriginalFormSnapshot] = useState<AiFormSnapshot | null>(null);
  const [workDetailsErrors, setWorkDetailsErrors] = useState<WorkDetailsValidationErrors>({});
  const [workDetailsFocusSignal, setWorkDetailsFocusSignal] = useState(0);
  const [draftMessage, setDraftMessage] = useState(
    storedDraft ? "Recuperamos tu borrador guardado." : draftLoadResult.failed ? "No se pudo recuperar el borrador anterior." : ""
  );
  const [lastSavedAt, setLastSavedAt] = useState(storedDraft?.savedAt ?? "");
  const [hasActiveDraft, setHasActiveDraft] = useState(Boolean(storedDraft));
  const [submissionStatus, setSubmissionStatus] = useState<RequestSubmissionStatus>("idle");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [publishedRequest, setPublishedRequest] = useState<ServiceRequestResponse | null>(null);
  const hasMountedRef = useRef(false);
  const loadedServerDraftIdRef = useRef("");
  const aiHighlightTimeoutRef = useRef<number | null>(null);
  const latestAiAnalysisRequestIdRef = useRef(0);
  const saveTimeoutRef = useRef<number | null>(null);
  const [draft, setDraft] = useState<ServiceRequestDraft>(() => mergeStoredDraft(storedDraft?.draft ?? null, categoryParam, serviceParam));

  const navigateToStep = (step: ServiceRequestDraft["currentStep"]) => {
    updateDraft({ currentStep: step });
    if (step === 1) setCategoryStepFocusSignal((current) => current + 1);
    if (step === 2) setDescriptionFocusSignal((current) => current + 1);
    if (step === 3) setWorkDetailsFocusSignal((current) => current + 1);
  };

  const clearAiVisualState = () => {
    if (aiHighlightTimeoutRef.current) {
      window.clearTimeout(aiHighlightTimeoutRef.current);
      aiHighlightTimeoutRef.current = null;
    }
    setAppliedAiAnalysisKey("");
    setAiHighlightedFields([]);
    setAiPanelMessage("");
    setAiAnalysisStale(false);
    setDetailsProviderMessage("");
  };

  const markAiAnalysisStale = () => {
    if (!aiAnalysis) return;
    setAppliedAiAnalysisKey("");
    setAiAnalysisStale(true);
    setAiPanelMessage("La descripción cambió. Vuelve a analizar para actualizar la recomendación.");
  };

  const showAiHighlights = (fields: AiHighlightedField[]) => {
    if (aiHighlightTimeoutRef.current) window.clearTimeout(aiHighlightTimeoutRef.current);
    setAiHighlightedFields(Array.from(new Set(fields)));
    aiHighlightTimeoutRef.current = window.setTimeout(() => {
      setAiHighlightedFields([]);
      aiHighlightTimeoutRef.current = null;
    }, 2600);
  };

  const updateDraft = (partialDraft: Partial<ServiceRequestDraft>) => {
    setDraft((current) => ({
      ...current,
      ...partialDraft,
      updatedAt: getNowIso()
    }));
  };

  const persistDraftImmediately = (nextDraft: ServiceRequestDraft, message: string) => {
    const stored = saveServiceRequestDraft(nextDraft);
    setDraft(nextDraft);
    setDraftMessage(message);
    setHasActiveDraft(true);
    if (stored) setLastSavedAt(stored.savedAt);
  };

  const validateFullRequest = () => {
    if (!selectedCategory || !draft.categoryId) {
      updateDraft({ currentStep: 1 });
      setSubmissionStatus("error");
      setSubmissionMessage("Selecciona una categor\u00eda para continuar.");
      return false;
    }

    if (draft.serviceId && (!selectedService || selectedService.categoryId !== selectedCategory.id)) {
      updateDraft({ currentStep: 1, serviceId: null, serviceSlug: "" });
      setSubmissionStatus("error");
      setSubmissionMessage("Selecciona un servicio v\u00e1lido para la categor\u00eda.");
      return false;
    }

    const nextDescriptionError = getDescriptionError(draft.originalDescription);
    setDescriptionError(nextDescriptionError);

    if (nextDescriptionError) {
      updateDraft({ currentStep: 2 });
      setDescriptionFocusSignal((current) => current + 1);
      setSubmissionStatus("error");
      setSubmissionMessage("Revisa los datos de la solicitud.");
      return false;
    }

    if (descriptionMentionsDifferentCategory(draft.originalDescription, selectedCategory.id, categories, services)) {
      setDescriptionError("La descripci\u00f3n contiene una categor\u00eda o servicio diferente al seleccionado.");
      updateDraft({ currentStep: 2, aiAssisted: false });
      setAiAnalysis(null);
      setAiAnalysisStatus("idle");
      setDescriptionFocusSignal((current) => current + 1);
      setSubmissionStatus("error");
      setSubmissionMessage("Revisa los datos de la solicitud.");
      return false;
    }

    const nextWorkDetailsErrors = getWorkDetailsErrors({
      flexibleSchedule: draft.flexibleSchedule,
      locationDescription: draft.locationDescription,
      postalCode: draft.postalCode,
      preferredDateFrom: draft.preferredDateFrom,
      preferredDateTo: draft.preferredDateTo,
      urgency: draft.urgency
    });
    setWorkDetailsErrors(nextWorkDetailsErrors);

    if (Object.keys(nextWorkDetailsErrors).length > 0) {
      updateDraft({ currentStep: 3 });
      setWorkDetailsFocusSignal((current) => current + 1);
      setSubmissionStatus("error");
      setSubmissionMessage("Revisa los datos de la solicitud.");
      return false;
    }

    const hasAnyBudget = draft.budgetMin !== null || draft.budgetMax !== null;
    if (hasAnyBudget && !isValidPriceRange(draft.budgetMin, draft.budgetMax)) {
      updateDraft({ currentStep: 4, budgetMin: null, budgetMax: null, aiAssisted: false });
      setSubmissionStatus("error");
      setSubmissionMessage("El precio orientativo de FixGo IA no es v\u00e1lido.");
      return false;
    }

    return true;
  };

  const buildDraftPayload = (): ServiceRequestDraftPayload => ({
    categoryId: selectedCategory?.id ?? draft.categoryId ?? 0,
    flexibleSchedule: draft.flexibleSchedule,
    budgetMin: draft.budgetMin,
    budgetMax: draft.budgetMax,
    aiAssisted: draft.aiAssisted,
    locationDescription: buildLocationDescription(draft.locationDescription, draft.postalCode),
    originalDescription: draft.originalDescription.trim(),
    postalCode: draft.postalCode.trim(),
    preferredDateFrom: draft.preferredDateFrom || null,
    preferredDateTo: draft.preferredDateTo || null,
    serviceId: selectedService?.id ?? draft.serviceId ?? null,
    title: draft.title.trim() || null,
    urgency: draft.urgency
  });
  const redirectToLoginWithDraft = () => {
    const nextDraft = {
      ...draft,
      currentStep: 4 as const,
      updatedAt: getNowIso()
    };

    persistDraftImmediately(nextDraft, "Guardamos tu borrador. Inicia sesión para continuar.");
    navigate("/acceder", {
      state: {
        from: {
          pathname: "/cliente/solicitar-presupuesto",
          search: ""
        }
      }
    });
  };

  const ensureAuthenticatedForSubmission = () => {
    if (initializing) {
      setSubmissionStatus("idle");
      setSubmissionMessage("Estamos comprobando tu sesión.");
      return false;
    }

    if (!isAuthenticated) {
      redirectToLoginWithDraft();
      return false;
    }

    return true;
  };

  const saveDraftOnServer = async (payload: ServiceRequestDraftPayload) => {
    if (draft.serverDraftId) {
      return updateServiceRequestDraft(draft.serverDraftId, payload);
    }

    return createServiceRequestDraft(payload);
  };

  const applyServerDraftId = (serverDraftId: string, message: string) => {
    const nextDraft = {
      ...draft,
      currentStep: 4 as const,
      serverDraftId,
      updatedAt: getNowIso()
    };

    persistDraftImmediately(nextDraft, message);
  };

  const handleSaveDraft = async () => {
    if (submissionStatus === "saving" || submissionStatus === "publishing") return;
    if (!validateFullRequest()) return;
    if (!ensureAuthenticatedForSubmission()) return;

    try {
      setSubmissionStatus("saving");
      setSubmissionMessage("");
      const response = await saveDraftOnServer(buildDraftPayload());
      applyServerDraftId(String(response.id), "Borrador guardado en tu cuenta.");
      setSubmissionStatus("saved");
      setSubmissionMessage("Borrador guardado en tu cuenta.");
    } catch (error) {
      setSubmissionStatus("error");
      setSubmissionMessage(getSubmissionErrorMessage(error));
    }
  };

  const handlePublishRequest = async () => {
    if (submissionStatus === "saving" || submissionStatus === "publishing" || submissionStatus === "published") return;
    if (!validateFullRequest()) return;
    if (!ensureAuthenticatedForSubmission()) return;

    try {
      setSubmissionStatus("publishing");
      setSubmissionMessage("");
      const savedDraft = await saveDraftOnServer(buildDraftPayload());
      const serverDraftId = String(savedDraft.id);
      const published = await publishServiceRequestDraft(serverDraftId);

      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
      removeServiceRequestDraft();
      setDraft(createEmptyDraft());
      setAiAnalysis(null);
      setAiAnalysisStatus("idle");
      clearAiVisualState();
      setSearchParams(new URLSearchParams());
      setHasActiveDraft(false);
      setLastSavedAt("");
      setDraftMessage("");
      setPublishedRequest(published);
      setSubmissionStatus("published");
      setSubmissionMessage("");
    } catch (error) {
      setSubmissionStatus("error");
      setSubmissionMessage(getSubmissionErrorMessage(error));
    }
  };

  const createAnotherRequest = () => {
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    removeServiceRequestDraft();
    setSearchParams(new URLSearchParams());
    setDraft(createEmptyDraft());
    setAiAnalysis(null);
    setAiAnalysisStatus("idle");
    clearAiVisualState();
    setDescriptionError("");
    setWorkDetailsErrors({});
    setHasActiveDraft(false);
    setLastSavedAt("");
    setDraftMessage("");
    setSubmissionStatus("idle");
    setSubmissionMessage("");
    setPublishedRequest(null);
  };

  useEffect(() => {
    setDraft((current) => {
      if (!categoryParam && !serviceParam) return current;
      if (current.categorySlug === categoryParam && current.serviceSlug === serviceParam) return current;

      return {
        ...current,
        categorySlug: categoryParam || current.categorySlug,
        serviceSlug: serviceParam || "",
        updatedAt: getNowIso()
      };
    });
  }, [categoryParam, serviceParam]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);

    if (!hasDraftContent(draft)) {
      removeServiceRequestDraft();
      setHasActiveDraft(false);
      setLastSavedAt("");
      return;
    }

    setDraftMessage("Guardando borrador...");
    saveTimeoutRef.current = window.setTimeout(() => {
      const stored = saveServiceRequestDraft(draft);
      if (stored) {
        setDraftMessage("Borrador guardado");
        setLastSavedAt(stored.savedAt);
        setHasActiveDraft(true);
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    };
  }, [draft]);

  useEffect(() => {
    let active = true;
    setCategoriesLoading(true);

    getCategories()
      .then((result) => {
        if (active) {
          setCategories(result);
          setCategoriesError("");
        }
      })
      .catch((error) => {
        if (active) {
          setCategoriesError(getErrorMessage(error, "Revisa que el backend esté activo e intenta nuevamente."));
        }
      })
      .finally(() => {
        if (active) setCategoriesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [categoriesReloadKey]);

  useEffect(() => {
    const draftId = Number(draftIdParam);
    if (!Number.isInteger(draftId) || draftId <= 0 || loadedServerDraftIdRef.current === draftIdParam) return;
    if (categoriesLoading || servicesLoading) return;

    loadedServerDraftIdRef.current = draftIdParam;
    getMyServiceRequestDraftDetail(draftId)
      .then((serverDraft) => {
        const category = categories.find((item) => item.id === serverDraft.categoryId) ?? null;
        const service = serverDraft.serviceId ? services.find((item) => item.id === serverDraft.serviceId) ?? null : null;
        setDraft({
          aiAssisted: serverDraft.aiAssisted,
          budgetMax: serverDraft.budgetMax,
          budgetMin: serverDraft.budgetMin,
          categoryId: serverDraft.categoryId,
          categorySlug: category?.slug ?? "",
          currentStep: 1,
          flexibleSchedule: serverDraft.flexibleSchedule,
          locationDescription: serverDraft.locationDescription ?? "",
          originalDescription: serverDraft.originalDescription,
          preferredDateFrom: serverDraft.preferredDateFrom ?? "",
          preferredDateTo: serverDraft.preferredDateTo ?? "",
          postalCode: "",
          serverDraftId: String(serverDraft.id),
          serviceId: serverDraft.serviceId,
          serviceSlug: service?.slug ?? "",
          title: serverDraft.title ?? "",
          updatedAt: getNowIso(),
          urgency: serverDraft.urgency
        });
        setDraftMessage("✓ Se creó un nuevo borrador a partir de la solicitud cancelada");
        setHasActiveDraft(true);
        navigateToStep(1);
      })
      .catch((error) => {
        setDraftMessage(getErrorMessage(error, "No se pudo abrir el nuevo borrador."));
      });
  }, [categories, categoriesLoading, draftIdParam, services, servicesLoading]);

  const selectedCategory = useMemo(() => {
    return categories.find((category) => category.slug === draft.categorySlug) ?? null;
  }, [categories, draft.categorySlug]);

  const invalidCategory = Boolean(draft.categorySlug) && !categoriesLoading && !categoriesError && !selectedCategory;

  useEffect(() => {
    setDraft((current) => {
      const categoryId = selectedCategory?.id ?? null;
      if (current.categoryId === categoryId) return current;
      return { ...current, categoryId, updatedAt: getNowIso() };
    });
  }, [selectedCategory]);

  useEffect(() => {
    let active = true;

    if (!selectedCategory) {
      setServices([]);
      setServicesError("");
      setServicesLoading(false);
      return;
    }

    setServicesLoading(true);
    setServicesError("");

    getServices({ category: selectedCategory.slug })
      .then((result) => {
        if (active) {
          setServices(result);
          setServicesError("");
        }
      })
      .catch((error) => {
        if (active) {
          setServices([]);
          setServicesError(getErrorMessage(error, "No fue posible cargar los servicios de esta categoría."));
        }
      })
      .finally(() => {
        if (active) setServicesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedCategory, servicesReloadKey]);

  const selectedService = useMemo(() => {
    return services.find((service) => service.slug === draft.serviceSlug) ?? null;
  }, [draft.serviceSlug, services]);

  const invalidService = Boolean(draft.serviceSlug) && Boolean(selectedCategory) && !servicesLoading && !servicesError && !selectedService;
  const canDiscardDraft = hasActiveDraft || hasDraftContent(draft);

  useEffect(() => {
    return () => {
      if (aiHighlightTimeoutRef.current) window.clearTimeout(aiHighlightTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    setDraft((current) => {
      if (servicesLoading && current.serviceSlug && !selectedService) return current;
      const serviceId = selectedService?.id ?? null;
      if (current.serviceId === serviceId) return current;
      return { ...current, serviceId, updatedAt: getNowIso() };
    });
  }, [selectedService, servicesLoading]);

  const selectCategory = (category: UiCategory) => {
    markAiAnalysisStale();
    updateDraft({
      aiAssisted: false,
      categoryId: category.id,
      categorySlug: category.slug,
      serviceId: null,
      serviceSlug: ""
    });
    setAiAnalysisStatus("idle");
    setSearchParams(buildSearchParams(category.slug, ""));
    setServiceScrollSignal((current) => current + 1);
  };

  const selectService = (service: ApiService) => {
    if (!selectedCategory || service.category.slug !== selectedCategory.slug) return;

    markAiAnalysisStale();
    updateDraft({
      aiAssisted: false,
      serviceId: service.id,
      serviceSlug: service.slug
    });
    setAiAnalysisStatus("idle");
    setSearchParams(buildSearchParams(selectedCategory.slug, service.slug));
  };

  const selectUnknownService = () => {
    if (!selectedCategory) return;

    markAiAnalysisStale();
    updateDraft({
      aiAssisted: false,
      serviceId: null,
      serviceSlug: ""
    });
    setAiAnalysisStatus("idle");
    setSearchParams(buildSearchParams(selectedCategory.slug, ""));
  };

  const discardDraft = () => {
    if (!window.confirm("¿Quieres descartar el borrador de esta solicitud?")) return;

    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    removeServiceRequestDraft();
    setSearchParams(new URLSearchParams());
    setDraft(createEmptyDraft());
    setAiAnalysis(null);
    setAiAnalysisStatus("idle");
    clearAiVisualState();
    setDescriptionError("");
    setWorkDetailsErrors({});
    setHasActiveDraft(false);
    setLastSavedAt("");
    setDraftMessage("Borrador descartado.");
  };

  const goToDescription = () => {
    if (!selectedCategory) return;
    navigateToStep(2);
  };

  const goToService = () => {
    navigateToStep(1);
  };

  const goToWorkDetails = () => {
    const error = getDescriptionError(draft.originalDescription);
    setDescriptionError(error);

    if (error) {
      setDescriptionFocusSignal((current) => current + 1);
      return;
    }

    navigateToStep(3);
  };

  const handleAnalyzeDescription = async () => {
    const error = getDescriptionError(draft.originalDescription);
    setDescriptionError(error);
    clearAiVisualState();

    if (error) {
      setDescriptionFocusSignal((current) => current + 1);
      return;
    }

    const analysisRequestId = latestAiAnalysisRequestIdRef.current + 1;
    latestAiAnalysisRequestIdRef.current = analysisRequestId;

    try {
      setAiAnalysisStatus("analyzing");
      setAiAnalysis(null);
      setAiPanelMessage("Generando otra propuesta...");
      const analysis = await analyzeServiceRequestWithAi({
        categoryId: selectedCategory?.id ?? draft.categoryId ?? null,
        categoryName: selectedCategory?.name ?? null,
        description: draft.originalDescription,
        serviceId: selectedService?.id ?? draft.serviceId ?? null,
        serviceName: selectedService?.name ?? null,
        title: draft.title || null,
        urgency: draft.urgency
      });

      if (latestAiAnalysisRequestIdRef.current !== analysisRequestId) return;

      setAiAnalysis(analysis);
      setAiAnalysisStatus("ready");
      setAiAnalysisStale(false);
      setAppliedAiAnalysisKey("");
      setAiPanelMessage("");
    } catch {
      if (latestAiAnalysisRequestIdRef.current !== analysisRequestId) return;
      setAiAnalysis(null);
      setAiAnalysisStatus("error");
    }
  };

  const applyAiAnalysis = () => {
    if (!aiAnalysis || aiAnalysisStale) return;

    const normalizedSuggestedCategoryName = normalizeText(aiAnalysis.suggestedCategoryName ?? "");
    const suggestedCategory = categories.find((category) => {
      if (!category.active) return false;
      if (aiAnalysis.suggestedCategoryId && category.id === aiAnalysis.suggestedCategoryId) return true;
      if (aiAnalysis.suggestedCategoryCode && category.code === aiAnalysis.suggestedCategoryCode) return true;
      return Boolean(normalizedSuggestedCategoryName) && normalizeText(category.name) === normalizedSuggestedCategoryName;
    }) ?? null;
    const suggestedService = aiAnalysis.suggestedServiceId
      ? services.find((service) => service.id === aiAnalysis.suggestedServiceId && (!suggestedCategory || service.categoryId === suggestedCategory.id)) ?? null
      : null;
    const suggestedServiceFromAnalysis =
      aiAnalysis.suggestedServiceId && aiAnalysis.suggestedServiceSlug && suggestedCategory
        ? {
            categoryId: suggestedCategory.id,
            id: aiAnalysis.suggestedServiceId,
            slug: aiAnalysis.suggestedServiceSlug
          }
        : null;
    const nextSuggestedService = suggestedService ?? suggestedServiceFromAnalysis;
    const budgetMin = aiAnalysis.suggestedBudgetRange.min;
    const budgetMax = aiAnalysis.suggestedBudgetRange.max;

    if (!suggestedCategory || !validUrgencies.has(aiAnalysis.suggestedUrgency) || !isValidPriceRange(budgetMin, budgetMax)) {
      setDraftMessage("La recomendaci\u00f3n de FixGo IA no es v\u00e1lida. Vuelve a analizar la solicitud.");
      return;
    }

    const nextDescription = aiAnalysis.improvedDescription.trim();
    const nextServiceId = nextSuggestedService?.categoryId === suggestedCategory.id ? nextSuggestedService.id : null;
    const nextServiceSlug = nextSuggestedService?.categoryId === suggestedCategory.id ? nextSuggestedService.slug : "";
    const highlightedFields: AiHighlightedField[] = [];

    if (draft.title !== aiAnalysis.suggestedTitle.trim()) highlightedFields.push("title");
    if (draft.originalDescription !== nextDescription) highlightedFields.push("description");
    if (draft.categoryId !== suggestedCategory.id || draft.categorySlug !== suggestedCategory.slug) highlightedFields.push("category");
    if (draft.serviceId !== nextServiceId || draft.serviceSlug !== nextServiceSlug) highlightedFields.push("service");
    if (draft.urgency !== aiAnalysis.suggestedUrgency) highlightedFields.push("urgency");
    if (draft.budgetMin !== budgetMin || draft.budgetMax !== budgetMax) highlightedFields.push("price");

    const nextDraft: ServiceRequestDraft = {
      ...draft,
      aiAssisted: true,
      budgetMax,
      budgetMin,
      categoryId: suggestedCategory.id,
      categorySlug: suggestedCategory.slug,
      originalDescription: nextDescription,
      serviceId: nextServiceId,
      serviceSlug: nextServiceSlug,
      title: aiAnalysis.suggestedTitle.trim(),
      urgency: aiAnalysis.suggestedUrgency,
      updatedAt: getNowIso()
    };

    setOriginalFormSnapshot({
      aiAssisted: draft.aiAssisted,
      budgetMax: draft.budgetMax,
      budgetMin: draft.budgetMin,
      categoryId: draft.categoryId,
      categorySlug: draft.categorySlug,
      description: draft.originalDescription,
      serviceId: draft.serviceId,
      serviceSlug: draft.serviceSlug,
      title: draft.title,
      urgency: draft.urgency
    });
    setDraft(nextDraft);
    setSearchParams(buildSearchParams(nextDraft.categorySlug, nextDraft.serviceSlug));
    setDescriptionError("");
    setDraftMessage("Recomendaci\u00f3n de FixGo IA aplicada");
    setAppliedAiAnalysisKey(buildAiAnalysisKey(aiAnalysis));
    setAiPanelMessage("✓ Recomendación de FixGo IA aplicada");
    setAiAnalysisStale(false);
    showAiHighlights(highlightedFields);
    setDescriptionFocusSignal((current) => current + 1);
  };

  const refineAdditionalDetails = async (details: string) => {
    const normalizedDetails = normalizeDetails(details);
    if (lastIntegratedDetails === normalizedDetails) {
      return "duplicate" as const;
    }

    try {
      setDetailsStatus("refining");
      const result = await refineServiceRequestDescriptionWithAi({
        additionalDetails: details,
        categoryId: draft.categoryId ? String(draft.categoryId) : null,
        currentDescription: draft.originalDescription,
        serviceId: draft.serviceId ? String(draft.serviceId) : null
      });

      updateDraft({
        aiAssisted: true,
        originalDescription: result.refinedDescription
      });
      if (aiAnalysis) {
        const nextAnalysis = {
          ...aiAnalysis,
          improvedDescription: result.refinedDescription,
          professionalInformationNeeded: result.professionalInformationNeeded.slice(0, 4)
        };
        setAiAnalysis(nextAnalysis);
        if (appliedAiAnalysisKey) setAppliedAiAnalysisKey(buildAiAnalysisKey(nextAnalysis));
      }
      setLastIntegratedDetails(normalizedDetails);
      setDescriptionError("");
      const refinedWithGroq = result.provider === "groq" && !result.fallbackUsed;
      setAiPanelMessage(refinedWithGroq ? "✓ Detalles corregidos e integrados con IA" : "✓ Detalles integrados con modo local de respaldo");
      setDetailsProviderMessage(refinedWithGroq ? "Última mejora de la descripción: Groq" : "Última mejora de la descripción: modo local de respaldo");
      setAiAnalysisStale(false);
      showAiHighlights(["description"]);
      setDescriptionFocusSignal((current) => current + 1);
      return "integrated" as const;
    } catch {
      return "error" as const;
    } finally {
      setDetailsStatus("idle");
    }
  };

  const generateAnotherAiProposal = () => {
    handleAnalyzeDescription();
  };

  const focusDescriptionForEditing = () => {
    setDescriptionFocusSignal((current) => current + 1);
  };

  const ignoreAiRecommendation = () => {
    setAiAnalysis(null);
    setAiAnalysisStatus("idle");
    setAppliedAiAnalysisKey("");
    setAiAnalysisStale(false);
    setAiPanelMessage("");
    setDetailsProviderMessage("");
  };

  const restorePreviousAiSnapshot = () => {
    if (!originalFormSnapshot) return;

    const nextDraft = {
      ...draft,
      aiAssisted: originalFormSnapshot.aiAssisted,
      budgetMax: originalFormSnapshot.budgetMax,
      budgetMin: originalFormSnapshot.budgetMin,
      categoryId: originalFormSnapshot.categoryId,
      categorySlug: originalFormSnapshot.categorySlug,
      originalDescription: originalFormSnapshot.description,
      serviceId: originalFormSnapshot.serviceId,
      serviceSlug: originalFormSnapshot.serviceSlug,
      title: originalFormSnapshot.title,
      urgency: originalFormSnapshot.urgency,
      updatedAt: getNowIso()
    };

    setDraft(nextDraft);
    setSearchParams(buildSearchParams(nextDraft.categorySlug, nextDraft.serviceSlug));
    setAppliedAiAnalysisKey("");
    setAiAnalysisStale(false);
    setAiPanelMessage("✓ Se restauraron tus datos anteriores");
    setDraftMessage("Se restauraron tus datos anteriores.");
    showAiHighlights(["title", "description", "category", "service", "urgency", "price"]);
    setDescriptionFocusSignal((current) => current + 1);
  };

  const goBackToDescription = () => {
    navigateToStep(2);
  };

  const goToReview = () => {
    const errors = getWorkDetailsErrors({
      flexibleSchedule: draft.flexibleSchedule,
      locationDescription: draft.locationDescription,
      postalCode: draft.postalCode,
      preferredDateFrom: draft.preferredDateFrom,
      preferredDateTo: draft.preferredDateTo,
      urgency: draft.urgency
    });
    setWorkDetailsErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    navigateToStep(4);
  };

  const goBackToWorkDetails = () => {
    navigateToStep(3);
  };

  return (
    <section className="request-page">
      <p className="instruction">* Completa los primeros datos para preparar tu solicitud</p>
      <div className="request-block">
        <h1>Solicita presupuesto</h1>
        <p>Selecciona el servicio y describe brevemente el trabajo que necesitas.</p>
        {publishedRequest ? null : <RequestStepIndicator currentStep={draft.currentStep} />}
      </div>

      {publishedRequest ? (
        <RequestSubmissionResult
          budgetMax={publishedRequest.budgetMax}
          budgetMin={publishedRequest.budgetMin}
          onCreateAnother={createAnotherRequest}
          onGoToBudgets={() => navigate("/cliente/mis-presupuestos")}
          requestId={publishedRequest.id}
          urgency={publishedRequest.urgency}
        />
      ) : (
        <>
          <RequestDraftNotice
            canDiscard={canDiscardDraft}
            message={draftMessage}
            onDiscard={discardDraft}
            savedAtText={formatSavedAt(lastSavedAt)}
          />

      {draft.currentStep === 1 ? (
        <>
          <CategoryServiceStep
            categories={categories}
            categoriesError={categoriesError}
            categoriesLoading={categoriesLoading}
            invalidCategory={invalidCategory}
            invalidService={invalidService}
            onRetryCategories={() => setCategoriesReloadKey((current) => current + 1)}
            onRetryServices={() => setServicesReloadKey((current) => current + 1)}
            onSelectCategory={selectCategory}
            onSelectService={selectService}
            onSelectUnknownService={selectUnknownService}
            serviceScrollSignal={serviceScrollSignal}
            selectedCategorySlug={draft.categorySlug}
            selectedServiceSlug={draft.serviceSlug}
            services={services}
            servicesError={servicesError}
            servicesLoading={servicesLoading}
            stepFocusSignal={categoryStepFocusSignal}
          />
          <RequestStepActions canContinue={Boolean(selectedCategory)} onContinue={goToDescription} />
        </>
      ) : null}

      {draft.currentStep === 2 ? (
        <DescriptionStep
          aiAnalysis={aiAnalysis}
          aiApplied={Boolean(aiAnalysis) && appliedAiAnalysisKey === buildAiAnalysisKey(aiAnalysis)}
          aiHighlightedFields={aiHighlightedFields}
          aiPanelMessage={aiPanelMessage}
          aiStale={aiAnalysisStale}
          aiStatus={aiAnalysisStatus}
          canRestoreAiSnapshot={Boolean(originalFormSnapshot)}
          description={draft.originalDescription}
          descriptionError={descriptionError}
          detailsProviderMessage={detailsProviderMessage}
          detailsStatus={detailsStatus}
          focusSignal={descriptionFocusSignal}
          onAdditionalDetailsRefine={refineAdditionalDetails}
          onAiApply={applyAiAnalysis}
          onAiAnalyze={handleAnalyzeDescription}
          onAiEditDescription={focusDescriptionForEditing}
          onAiGenerateAnother={generateAnotherAiProposal}
          onAiIgnore={ignoreAiRecommendation}
          onAiRestorePrevious={restorePreviousAiSnapshot}
          onBack={goToService}
          onContinue={goToWorkDetails}
          onDescriptionChange={(value) => {
            markAiAnalysisStale();
            updateDraft({ aiAssisted: false, originalDescription: value });
            setAiAnalysisStatus("idle");
            if (descriptionError && !getDescriptionError(value)) setDescriptionError("");
          }}
          onTitleChange={(value) => {
            markAiAnalysisStale();
            updateDraft({ aiAssisted: false, title: value });
            setAiAnalysisStatus("idle");
          }}
          title={draft.title}
        />
      ) : null}

      {draft.currentStep === 3 ? (
        <>
          <WorkDetailsStep
            errors={workDetailsErrors}
            flexibleSchedule={draft.flexibleSchedule}
            focusSignal={workDetailsFocusSignal}
            locationDescription={draft.locationDescription}
            onFlexibleScheduleChange={(value) => {
              updateDraft({ flexibleSchedule: value });
              setWorkDetailsErrors({});
            }}
            onLocationDescriptionChange={(value) => {
              updateDraft({ locationDescription: value });
              if (workDetailsErrors.locationDescription) setWorkDetailsErrors({});
            }}
            onPostalCodeChange={(value) => {
              updateDraft({ postalCode: value });
              if (workDetailsErrors.postalCode) setWorkDetailsErrors({});
            }}
            onPreferredDateFromChange={(value) => {
              updateDraft({ preferredDateFrom: value });
              if (workDetailsErrors.preferredDateFrom || workDetailsErrors.preferredDateTo) setWorkDetailsErrors({});
            }}
            onPreferredDateToChange={(value) => {
              updateDraft({ preferredDateTo: value });
              if (workDetailsErrors.preferredDateTo) setWorkDetailsErrors({});
            }}
            onUrgencyChange={(value) => {
              updateDraft({ urgency: value });
              if (workDetailsErrors.urgency) setWorkDetailsErrors({});
            }}
            preferredDateFrom={draft.preferredDateFrom}
            preferredDateTo={draft.preferredDateTo}
            postalCode={draft.postalCode}
            urgency={draft.urgency}
          />
          <RequestStepActions continueLabel="Continuar a revisión" onBack={goBackToDescription} onContinue={goToReview} />
        </>
      ) : null}

      {draft.currentStep === 4 ? (
        <>
          <ReviewStep
            categoryName={selectedCategory?.name ?? "Categoría no disponible"}
            description={draft.originalDescription}
            flexibleSchedule={draft.flexibleSchedule}
            budgetMax={draft.budgetMax}
            budgetMin={draft.budgetMin}
            locationDescription={buildLocationDescription(draft.locationDescription, draft.postalCode)}
            onEditDescription={() => {
              navigateToStep(2);
            }}
            onEditService={() => navigateToStep(1)}
            onEditWorkDetails={goBackToWorkDetails}
            preferredDateFrom={draft.preferredDateFrom}
            preferredDateTo={draft.preferredDateTo}
            serviceName={selectedService?.name ?? null}
            title={draft.title}
            urgency={draft.urgency}
          />
          <RequestSubmissionActions
            message={submissionMessage}
            onContinueEditing={() => {
              setSubmissionStatus("idle");
              setSubmissionMessage("");
            }}
            onGoHome={() => navigate("/cliente/inicio")}
            onGoToRequests={() => navigate("/cliente/mis-presupuestos")}
            onPublish={handlePublishRequest}
            onSave={handleSaveDraft}
            saveLabel={draft.serverDraftId ? "Guardar cambios" : "Guardar borrador"}
            status={submissionStatus}
          />
          <RequestStepActions onBack={goBackToWorkDetails} />
        </>
      ) : null}
        </>
      )}
    </section>
  );
}
