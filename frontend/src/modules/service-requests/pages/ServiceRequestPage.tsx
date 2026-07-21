import { fallbackCategories } from "../../categories/data/categoryFallbacks";
import { getCategories } from "../../categories/services/categoriesApi";
import { SearchBox } from "../../../shared/components/SearchBox";
import { useAsyncData } from "../../../shared/hooks/useAsyncData";

export function ServiceRequestPage() {
  const { data: categories } = useAsyncData(getCategories, fallbackCategories);

  return (
    <section className="request-page">
      <p className="instruction">* Escribe lo que necesitas o selecciona la categoria que mas se ajusta a tu proyecto</p>
      <div className="request-block">
        <h1>Describe tu proyecto</h1>
        <p>Cuentanos que necesitas y te mostraremos los servicios mas adecuados</p>
        <SearchBox placeholder="Ej: Necesito arreglar una fuga de agua en la cocina" />
      </div>
      <div className="or-divider"><span>o</span></div>
      <div className="request-block">
        <h2>Escoge una categoria</h2>
        <p>Elige el tipo de servicio que necesitas para iniciar tu presupuesto</p>
        <div className="category-grid">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button className="category-card" key={category.name}>
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
