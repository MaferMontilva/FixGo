import { useNavigate } from "react-router-dom";
import { fallbackCategories, getCategories } from "../../categories";
import type { UiCategory } from "../../categories";
import { getServices, ServiceResultsList } from "../../services";
import type { ApiService } from "../../services";
import { SearchBox } from "../../../shared/components/SearchBox";
import { useAsyncData } from "../../../shared/hooks/useAsyncData";
import { useMemo, useState } from "react";

function matchesCategory(category: UiCategory, query: string) {
  const normalizedQuery = query.toLowerCase();
  return [category.name, category.slug, category.code, category.description]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalizedQuery));
}

function categoryUrl(category: UiCategory) {
  return `/cliente/solicitar-presupuesto?category=${encodeURIComponent(category.slug)}`;
}

function serviceUrl(service: ApiService) {
  const params = new URLSearchParams({
    category: service.category.slug,
    service: service.slug
  });

  return `/cliente/solicitar-presupuesto?${params.toString()}`;
}

export function HomeMarketplacePage() {
  const navigate = useNavigate();
  const { data: categories, error: categoriesError, loading } = useAsyncData(getCategories, fallbackCategories);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [serviceResults, setServiceResults] = useState<ApiService[]>([]);
  const [servicesError, setServicesError] = useState("");
  const [searching, setSearching] = useState(false);

  const categoryResults = useMemo(() => {
    if (!submittedQuery.trim() || categoriesError) return [];
    return categories.filter((category) => matchesCategory(category, submittedQuery));
  }, [categories, categoriesError, submittedQuery]);

  const handleSearch = async (value: string) => {
    const cleanValue = value.trim();
    setSearchError("");
    setServicesError("");
    setServiceResults([]);
    setSubmittedQuery(cleanValue);

    if (!cleanValue) {
      setSearchError("Escribe el servicio que necesitas.");
      return;
    }

    setSearching(true);

    try {
      setServiceResults(await getServices({ search: cleanValue }));
    } catch {
      setServicesError("No fue posible buscar servicios. Revisa la conexión e intenta nuevamente.");
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSubmittedQuery("");
    setSearchError("");
    setServicesError("");
    setServiceResults([]);
  };

  const showEmptyResults =
    submittedQuery && !searchError && !servicesError && !searching && !categoryResults.length && !serviceResults.length;

  return (
    <>
      <section className="marketplace-hero">
        <h1>Tu hogar, nuestro proyecto</h1>
        <p>Elige el servicio de instalación, mantenimiento o reforma que necesitas</p>
        <SearchBox
          buttonLabel="Buscar"
          error={searchError}
          id="home-search"
          onChange={setQuery}
          onSearch={handleSearch}
          placeholder="Escribe lo que necesitas..."
          value={query}
        />
        {searchError ? (
          <p className="inline-error" id="home-search-error">
            {searchError}
          </p>
        ) : null}
        {servicesError ? <p className="inline-error">{servicesError}</p> : null}
        {searching ? <p className="inline-status">Buscando servicios...</p> : null}
        {submittedQuery && !searchError && !servicesError && !searching ? (
          <div className="search-results-panel">
            {categoryResults.length ? (
              <>
                <strong>Categorías relacionadas</strong>
                <div className="search-result-list">
                  {categoryResults.map((category) => (
                    <button key={category.id} onClick={() => navigate(categoryUrl(category))}>
                      {category.name}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
            {serviceResults.length ? (
              <>
                <strong>Servicios relacionados</strong>
                <ServiceResultsList services={serviceResults} onSelect={(service) => navigate(serviceUrl(service))} />
              </>
            ) : null}
            {showEmptyResults ? (
              <>
                <strong>No encontramos servicios relacionados con «{submittedQuery}».</strong>
                <div className="empty-actions">
                  <button onClick={clearSearch}>Limpiar búsqueda</button>
                  <button onClick={() => navigate("/cliente/solicitar-presupuesto")}>Describir mi necesidad</button>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </section>
      <section className="content-section">
        <h2>Servicios de temporada</h2>
        <p>Adapta tu hogar para los meses de más calor</p>
        {categoriesError ? (
          <div className="data-state">
            <strong>No fue posible cargar las categorías.</strong>
            <span>Revisa que el backend esté activo e intenta nuevamente.</span>
            <button onClick={() => window.location.reload()}>Reintentar</button>
          </div>
        ) : null}
        <div className="season-grid">
          {!categoriesError &&
            categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  aria-busy={loading}
                  className="season-card"
                  key={category.id}
                  onClick={() => navigate(categoryUrl(category))}
                >
                  <Icon size={44} />
                  <strong>{category.name}</strong>
                </button>
              );
            })}
        </div>
      </section>
    </>
  );
}
