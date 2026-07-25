import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fallbackCategories, getCategories } from "../../categories";
import type { UiCategory } from "../../categories";
import { getServices } from "../../services";
import type { ApiService } from "../../services";
import { CategoryServiceStep } from "../components/CategoryServiceStep";
import { DescriptionStep } from "../components/DescriptionStep";
import { RequestStepActions } from "../components/RequestStepActions";
import { RequestStepIndicator } from "../components/RequestStepIndicator";
import { WorkDetailsStep } from "../components/WorkDetailsStep";
import type { ServiceRequestDraft } from "../types/serviceRequest";
import { getDescriptionError } from "../validation/serviceRequestValidation";

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

export function ServiceRequestPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") ?? "";
  const serviceParam = searchParams.get("service") ?? "";

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
  const [workDetailsFocusSignal, setWorkDetailsFocusSignal] = useState(0);
  const [draft, setDraft] = useState<ServiceRequestDraft>(() => ({
    categoryId: null,
    categorySlug: categoryParam,
    currentStep: 1,
    flexibleSchedule: true,
    locationDescription: "",
    originalDescription: "",
    preferredDateFrom: "",
    preferredDateTo: "",
    serviceId: null,
    serviceSlug: serviceParam,
    title: "",
    updatedAt: getNowIso(),
    urgency: "NORMAL"
  }));

  const updateDraft = (partialDraft: Partial<ServiceRequestDraft>) => {
    setDraft((current) => ({
      ...current,
      ...partialDraft,
      updatedAt: getNowIso()
    }));
  };

  useEffect(() => {
    setDraft((current) => {
      if (current.categorySlug === categoryParam && current.serviceSlug === serviceParam) return current;

      return {
        ...current,
        categorySlug: categoryParam,
        serviceSlug: serviceParam,
        updatedAt: getNowIso()
      };
    });
  }, [categoryParam, serviceParam]);

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

  return (
    <section className="request-page">
      <p className="instruction">* Completa los primeros datos para preparar tu solicitud</p>
      <div className="request-block">
        <h1>Solicita presupuesto</h1>
        <p>Selecciona el servicio y describe brevemente el trabajo que necesitas.</p>
        <RequestStepIndicator currentStep={draft.currentStep} />
      </div>

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
            errors={{}}
            flexibleSchedule={draft.flexibleSchedule}
            focusSignal={workDetailsFocusSignal}
            locationDescription={draft.locationDescription}
            onFlexibleScheduleChange={(value) => updateDraft({ flexibleSchedule: value })}
            onLocationDescriptionChange={(value) => updateDraft({ locationDescription: value })}
            onPreferredDateFromChange={(value) => updateDraft({ preferredDateFrom: value })}
            onPreferredDateToChange={(value) => updateDraft({ preferredDateTo: value })}
            onUrgencyChange={(value) => updateDraft({ urgency: value })}
            preferredDateFrom={draft.preferredDateFrom}
            preferredDateTo={draft.preferredDateTo}
            urgency={draft.urgency}
          />
          <RequestStepActions onBack={goBackToDescription} />
        </>
      ) : null}
    </section>
  );
}
