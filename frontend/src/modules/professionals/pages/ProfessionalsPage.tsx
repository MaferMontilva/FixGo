import { CheckCircle2, MapPin, SlidersHorizontal } from "lucide-react";
import { fallbackCategories } from "../../categories/data/categoryFallbacks";
import { getCategories } from "../../categories/services/categoriesApi";
import { fallbackProfessionals } from "../data/professionalFallbacks";
import { getProfessionals } from "../services/professionalsApi";
import { useAsyncData } from "../../../shared/hooks/useAsyncData";

export function ProfessionalsPage() {
  const { data: categories } = useAsyncData(getCategories, fallbackCategories);
  const { data: professionals } = useAsyncData(getProfessionals, fallbackProfessionals);

  return (
    <>
      <section className="professionals-top">
        <h1>Encuentra tu profesional</h1>
        <p>Profesionales disponibles en la red FixGo</p>
        <div className="professional-search-row">
          <input placeholder="Buscar por nombre..." />
          <select aria-label="Ordenar profesionales">
            <option>Relevancia</option>
            <option>Mejor valorados</option>
            <option>Mas cercanos</option>
          </select>
        </div>
      </section>
      <section className="professionals-layout">
        <aside className="filters">
          <h2><SlidersHorizontal size={20} /> Filtros</h2>
          <span>Gremio</span>
          <div className="filter-list">
            {categories.slice(0, 12).map((category) => <button key={category.name}>{category.name}</button>)}
          </div>
        </aside>
        <div className="professional-grid">
          {professionals.map((professional) => (
            <article className="professional-card" key={professional.name}>
              <div className="professional-cover">
                <span>{professional.trade}</span>
              </div>
              <div className="professional-avatar">FG</div>
              <div className="professional-info">
                <h3>{professional.name} {professional.verified && <CheckCircle2 size={18} />}</h3>
                <p><MapPin size={16} /> {professional.location}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
