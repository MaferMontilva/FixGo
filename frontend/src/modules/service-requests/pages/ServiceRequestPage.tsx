import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fallbackCategories, getCategories } from "../../categories";
import { getServiceBySlug } from "../../services";
import type { ApiService } from "../../services";
import { SearchBox } from "../../../shared/components/SearchBox";
import { useAsyncData } from "../../../shared/hooks/useAsyncData";

export function ServiceRequestPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategorySlug = searchParams.get("category") ?? "";
  const selectedServiceSlug = searchParams.get("service") ?? "";
  const { data: categories, error: categoriesError, loading } = useAsyncData(getCategories, fallbackCategories);
  const [selectedService, setSelectedService] = useState<ApiService | null>(null);
  const [serviceError, setServiceError] = useState("");
  const selectedCategory = useMemo(() => {
    return categories.find((category) => category.slug === selectedCategorySlug) ?? null;
  }, [categories, selectedCategorySlug]);

  useEffect(() => {
    let active = true;

    if (!selectedServiceSlug) {
      setSelectedService(null);
      setServiceError("");
      return;
    }

    getServiceBySlug(selectedServiceSlug)
      .then((service) => {
        if (active) {
          setSelectedService(service);
          setServiceError("");
        }
      })
      .catch(() => {
        if (active) {
          setSelectedService(null);
          setServiceError("No fue posible cargar el servicio seleccionado.");
        }
      });

    return () => {
      active = false;
    };
  }, [selectedServiceSlug]);

  const selectCategory = (slug: string) => {
    setSearchParams({ category: slug });
  };

  return (
    <section className="request-page">
      <p className="instruction">* Escribe lo que necesitas o selecciona la categoría que más se ajusta a tu proyecto</p>
      <div className="request-block">
        <h1>Describe tu proyecto</h1>
        <p>Cuéntanos qué necesitas y te mostraremos los servicios más adecuados</p>
        <SearchBox placeholder="Ej: Necesito arreglar una fuga de agua en la cocina" />
        {selectedCategory || selectedService || serviceError ? (
          <div className="selected-summary">
            {selectedCategory ? (
              <span>
                Categoría seleccionada: <strong>{selectedCategory.name}</strong>
              </span>
            ) : null}
            {selectedService ? (
              <span>
                Servicio seleccionado: <strong>{selectedService.name}</strong>
              </span>
            ) : null}
            {serviceError ? <span>{serviceError}</span> : null}
          </div>
        ) : null}
      </div>
      <div className="or-divider"><span>o</span></div>
      <div className="request-block">
        <h2>Escoge una categoría</h2>
        <p>Elige el tipo de servicio que necesitas para iniciar tu presupuesto</p>
        {categoriesError ? (
          <div className="data-state">
            <strong>No fue posible cargar las categorías.</strong>
            <span>Revisa que el backend esté activo e intenta nuevamente.</span>
            <button onClick={() => window.location.reload()}>Reintentar</button>
          </div>
        ) : null}
        <div className="category-grid">
          {!categoriesError &&
            categories.map((category) => {
              const Icon = category.icon;
              const active = selectedCategorySlug === category.slug;
              return (
                <button
                  aria-busy={loading}
                  aria-pressed={active}
                  className={active ? "category-card is-selected" : "category-card"}
                  key={category.id}
                  onClick={() => selectCategory(category.slug)}
                >
                  <Icon size={56} />
                  <span>{category.name}</span>
                </button>
              );
            })}
        </div>
      </div>
    </section>
  );
}
