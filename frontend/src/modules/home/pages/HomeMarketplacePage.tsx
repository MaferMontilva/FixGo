import { useNavigate } from "react-router-dom";
import { fallbackCategories, getCategories } from "../../categories";
import { SearchBox } from "../../../shared/components/SearchBox";
import { useAsyncData } from "../../../shared/hooks/useAsyncData";

export function HomeMarketplacePage() {
  const navigate = useNavigate();
  const { data: categories } = useAsyncData(getCategories, fallbackCategories);

  return (
    <>
      <section className="marketplace-hero">
        <h1>Tu hogar, nuestro proyecto</h1>
        <p>Elige el servicio de instalación, mantenimiento o reforma que necesitas</p>
        <SearchBox placeholder="Escribe lo que necesitas..." />
      </section>
      <section className="content-section">
        <h2>Servicios de temporada</h2>
        <p>Adapta tu hogar para los meses de más calor</p>
        <div className="season-grid">
          {categories.slice(0, 3).map((category) => {
            const Icon = category.icon;
            return (
              <button
                className="season-card"
                key={category.name}
                onClick={() => navigate("/cliente/solicitar-presupuesto")}
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
