import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fallbackCategories, getCategories } from "../../categories";
import type { UiCategory } from "../../categories";
import { getServices } from "../../services";
import type { ApiService } from "../../services";
import { CategoryServiceStep } from "../components/CategoryServiceStep";
import { DescriptionStep } from "../components/DescriptionStep";
import { RequestDraftNotice } from "../components/RequestDraftNotice";
import { RequestStepActions } from "../components/RequestStepActions";
import { RequestStepIndicator } from "../components/RequestStepIndicator";
import { ReviewStep } from "../components/ReviewStep";
import { WorkDetailsStep } from "../components/WorkDetailsStep";
import {
  loadServiceRequestDraftResult,
  removeServiceRequestDraft,
  saveServiceRequestDraft
} from "../storage/serviceRequestDraftStorage";
import type { ServiceRequestDraft } from "../types/serviceRequest";
import { getDescriptionError, getWorkDetailsErrors } from "../validation/serviceRequestValidation";
import type { WorkDetailsValidationErrors } from "../validation/serviceRequestValidation";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
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

function createEmptyDraft(categorySlug = "", serviceSlug = ""): ServiceRequestDraft {
  return {
    categoryId: null,
    categorySlug,
    currentStep: 1,
    flexibleSchedule: true,
    locationDescription: "",
    originalDescription: "",
    preferredDateFrom: "",
    preferredDateTo: "",
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
      draft.preferredDateFrom ||
      draft.preferredDateTo ||
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
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") ?? "";
  const serviceParam = searchParams.get("service") ?? "";
  const [draftLoadResult] = useState(() => loadServiceRequestDraftResult());
  const storedDraft = draftLoadResult.storedDraft;

  const [categories, setCategories] = useState<UiCategory[]>(fallbackCategories);
  const [categoriesError, setCategoriesError] = useState("");
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesReloadKey, setCategoriesReloadKey] = useState(0);
  const [services, setServices] = useState<ApiService[]>([]);
  const [servicesError, setServicesError] = useState("");
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesReloadKey, setServicesReloadKey] = useState(0);
  const [descriptionError, setDescriptionError] = useState("");
  const [descriptionFocusSignal, setDescriptionFocusSignal] = useState(0);
  const [workDetailsErrors, setWorkDetailsErrors] = useState<WorkDetailsValidationErrors>({});
  const [workDetailsFocusSignal, setWorkDetailsFocusSignal] = useState(0);
  const [draftMessage, setDraftMessage] = useState(
    storedDraft ? "Recuperamos tu borrador guardado." : draftLoadResult.failed ? "No se pudo recuperar el borrador anterior." : ""
  );
  const [lastSavedAt, setLastSavedAt] = useState(storedDraft?.savedAt ?? "");
  const [hasActiveDraft, setHasActiveDraft] = useState(Boolean(storedDraft));
  const hasMountedRef = useRef(false);
  const saveTimeoutRef = useRef<number | null>(null);
  const [draft, setDraft] = useState<ServiceRequestDraft>(() => mergeStoredDraft(storedDraft?.draft ?? null, categoryParam, serviceParam));

  const updateDraft = (partialDraft: Partial<ServiceRequestDraft>) => {
    setDraft((current) => ({
      ...current,
      ...partialDraft,
      updatedAt: getNowIso()
    }));
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
    setDraft((current) => {
      const serviceId = selectedService?.id ?? null;
      if (current.serviceId === serviceId) return current;
      return { ...current, serviceId, updatedAt: getNowIso() };
    });
  }, [selectedService]);

  const selectCategory = (category: UiCategory) => {
    updateDraft({
      categoryId: category.id,
      categorySlug: category.slug,
      serviceId: null,
      serviceSlug: ""
    });
    setSearchParams(buildSearchParams(category.slug, ""));
  };

  const selectService = (service: ApiService) => {
    if (!selectedCategory || service.category.slug !== selectedCategory.slug) return;

    updateDraft({
      serviceId: service.id,
      serviceSlug: service.slug
    });
    setSearchParams(buildSearchParams(selectedCategory.slug, service.slug));
  };

  const selectUnknownService = () => {
    if (!selectedCategory) return;

    updateDraft({
      serviceId: null,
      serviceSlug: ""
    });
    setSearchParams(buildSearchParams(selectedCategory.slug, ""));
  };

  const discardDraft = () => {
    if (!window.confirm("¿Quieres descartar el borrador de esta solicitud?")) return;

    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    removeServiceRequestDraft();
    setSearchParams(new URLSearchParams());
    setDraft(createEmptyDraft());
    setDescriptionError("");
    setWorkDetailsErrors({});
    setHasActiveDraft(false);
    setLastSavedAt("");
    setDraftMessage("Borrador descartado.");
  };

  const goToDescription = () => {
    if (!selectedCategory) return;
    updateDraft({ currentStep: 2 });
    setDescriptionFocusSignal((current) => current + 1);
  };

  const goToService = () => {
    updateDraft({ currentStep: 1 });
  };

  const goToWorkDetails = () => {
    const error = getDescriptionError(draft.originalDescription);
    setDescriptionError(error);

    if (error) {
      setDescriptionFocusSignal((current) => current + 1);
      return;
    }

    updateDraft({ currentStep: 3 });
    setWorkDetailsFocusSignal((current) => current + 1);
  };

  const goBackToDescription = () => {
    updateDraft({ currentStep: 2 });
    setDescriptionFocusSignal((current) => current + 1);
  };

  const goToReview = () => {
    const errors = getWorkDetailsErrors({
      flexibleSchedule: draft.flexibleSchedule,
      locationDescription: draft.locationDescription,
      preferredDateFrom: draft.preferredDateFrom,
      preferredDateTo: draft.preferredDateTo,
      urgency: draft.urgency
    });
    setWorkDetailsErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    updateDraft({ currentStep: 4 });
  };

  const goBackToWorkDetails = () => {
    updateDraft({ currentStep: 3 });
    setWorkDetailsFocusSignal((current) => current + 1);
  };

  return (
    <section className="request-page">
      <p className="instruction">* Completa los primeros datos para preparar tu solicitud</p>
      <div className="request-block">
        <h1>Solicita presupuesto</h1>
        <p>Selecciona el servicio y describe brevemente el trabajo que necesitas.</p>
        <RequestStepIndicator currentStep={draft.currentStep} />
      </div>

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
            selectedCategorySlug={draft.categorySlug}
            selectedServiceSlug={draft.serviceSlug}
            services={services}
            servicesError={servicesError}
            servicesLoading={servicesLoading}
          />
          <RequestStepActions canContinue={Boolean(selectedCategory)} onContinue={goToDescription} />
        </>
      ) : null}

      {draft.currentStep === 2 ? (
        <DescriptionStep
          description={draft.originalDescription}
          descriptionError={descriptionError}
          focusSignal={descriptionFocusSignal}
          onBack={goToService}
          onContinue={goToWorkDetails}
          onDescriptionChange={(value) => {
            updateDraft({ originalDescription: value });
            if (descriptionError && !getDescriptionError(value)) setDescriptionError("");
          }}
          onTitleChange={(value) => updateDraft({ title: value })}
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
            locationDescription={draft.locationDescription}
            onEditDescription={() => {
              updateDraft({ currentStep: 2 });
              setDescriptionFocusSignal((current) => current + 1);
            }}
            onEditService={() => updateDraft({ currentStep: 1 })}
            onEditWorkDetails={goBackToWorkDetails}
            preferredDateFrom={draft.preferredDateFrom}
            preferredDateTo={draft.preferredDateTo}
            serviceName={selectedService?.name ?? null}
            title={draft.title}
            urgency={draft.urgency}
          />
          <RequestStepActions onBack={goBackToWorkDetails} />
        </>
      ) : null}
    </section>
  );
}
