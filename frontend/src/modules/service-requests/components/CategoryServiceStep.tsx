import { useEffect, useRef } from "react";
import type { UiCategory } from "../../categories";
import type { ApiService } from "../../services";

type CategoryServiceStepProps = {
  categories: UiCategory[];
  categoriesError: string;
  categoriesLoading: boolean;
  invalidCategory: boolean;
  invalidService: boolean;
  onRetryCategories: () => void;
  onRetryServices: () => void;
  onSelectCategory: (category: UiCategory) => void;
  onSelectUnknownService: () => void;
  onSelectService: (service: ApiService) => void;
  serviceScrollSignal: number;
  stepFocusSignal: number;
  selectedCategorySlug: string;
  selectedServiceSlug: string;
  services: ApiService[];
  servicesError: string;
  servicesLoading: boolean;
};

export function CategoryServiceStep({
  categories,
  categoriesError,
  categoriesLoading,
  invalidCategory,
  invalidService,
  onRetryCategories,
  onRetryServices,
  onSelectCategory,
  onSelectUnknownService,
  onSelectService,
  serviceScrollSignal,
  stepFocusSignal,
  selectedCategorySlug,
  selectedServiceSlug,
  services,
  servicesError,
  servicesLoading
}: CategoryServiceStepProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const unknownServiceRef = useRef<HTMLButtonElement | null>(null);
  const firstServiceRef = useRef<HTMLButtonElement | null>(null);
  const lastScrollSignalRef = useRef(0);
  const hasSelectedCategory = Boolean(selectedCategorySlug) && !invalidCategory;
  const unknownServiceSelected = hasSelectedCategory && !selectedServiceSlug;

  useEffect(() => {
    if (!hasSelectedCategory || servicesLoading || servicesError || serviceScrollSignal === 0 || lastScrollSignalRef.current === serviceScrollSignal) return;

    lastScrollSignalRef.current = serviceScrollSignal;
    const target = services.length > 0 ? headingRef.current ?? firstServiceRef.current : unknownServiceRef.current ?? headingRef.current;
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
    target?.focus();
  }, [hasSelectedCategory, serviceScrollSignal, services.length, servicesError, servicesLoading]);

  useEffect(() => {
    if (stepFocusSignal === 0) return;
    stepHeadingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    stepHeadingRef.current?.focus();
  }, [stepFocusSignal]);

  return (
    <div className="request-step-panel">
      <div className="request-step-heading">
        <h2 ref={stepHeadingRef} tabIndex={-1}>Selecciona categoría y servicio</h2>
        <p>Elige primero el tipo de trabajo. Después podrás seleccionar un servicio concreto si lo tienes claro.</p>
      </div>

      {categoriesError ? (
        <div className="data-state">
          <strong>No fue posible cargar las categorías.</strong>
          <span>{categoriesError}</span>
          <button onClick={onRetryCategories} type="button">Reintentar</button>
        </div>
      ) : null}

      {invalidCategory ? (
        <p className="form-error" role="alert">La categoría indicada no existe.</p>
      ) : null}

      {categoriesLoading ? <p className="request-loading-state">Cargando categorías...</p> : null}

      {!categoriesLoading && !categoriesError && categories.length === 0 ? (
        <div className="data-state">
          <strong>No hay categorías disponibles.</strong>
          <span>Intenta nuevamente en unos minutos.</span>
          <button onClick={onRetryCategories} type="button">Reintentar</button>
        </div>
      ) : null}

      <div className="category-grid request-category-grid" aria-busy={categoriesLoading}>
        {!categoriesError &&
          categories.map((category) => {
            const Icon = category.icon;
            const active = selectedCategorySlug === category.slug;

            return (
              <button
                aria-pressed={active}
                className={active ? "category-card is-selected" : "category-card"}
                key={category.id}
                onClick={() => onSelectCategory(category)}
                type="button"
              >
                <Icon size={52} />
                <span>{category.name}</span>
              </button>
            );
          })}
      </div>

      {hasSelectedCategory ? (
        <div className="request-services-block">
          <div className="request-step-heading compact">
            <h3 ref={headingRef} tabIndex={-1}>Servicio</h3>
            <p>Selecciona un servicio o continúa sin especificarlo.</p>
          </div>

          {servicesError ? (
            <div className="data-state">
              <strong>No fue posible cargar los servicios.</strong>
              <span>{servicesError}</span>
              <button onClick={onRetryServices} type="button">Reintentar</button>
            </div>
          ) : null}

          {invalidService ? (
            <p className="form-error" role="alert">El servicio indicado no existe para esta categoría.</p>
          ) : null}

          {servicesLoading ? <p className="request-loading-state">Cargando servicios...</p> : null}

          {!servicesLoading && !servicesError && services.length === 0 ? (
            <div className="data-state">
              <strong>No hay servicios específicos disponibles.</strong>
              <span>Puedes continuar indicando que todavía no conoces el servicio exacto.</span>
            </div>
          ) : null}

          <div className="service-choice-grid" aria-busy={servicesLoading}>
            <button
              aria-pressed={unknownServiceSelected}
              className={unknownServiceSelected ? "service-choice-card is-selected" : "service-choice-card"}
              onClick={onSelectUnknownService}
              ref={unknownServiceRef}
              type="button"
            >
              <strong>Todavía no sé qué servicio específico necesito</strong>
              <span>FixGo usará tu descripción para orientar mejor la solicitud más adelante.</span>
            </button>

            {!servicesError &&
              services.map((service, index) => {
                const active = selectedServiceSlug === service.slug;

                return (
                  <button
                    aria-pressed={active}
                    className={active ? "service-choice-card is-selected" : "service-choice-card"}
                    key={service.id}
                    onClick={() => onSelectService(service)}
                    ref={index === 0 ? firstServiceRef : undefined}
                    type="button"
                  >
                    <strong>{service.name}</strong>
                    {service.description ? <span>{service.description}</span> : null}
                  </button>
                );
              })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
