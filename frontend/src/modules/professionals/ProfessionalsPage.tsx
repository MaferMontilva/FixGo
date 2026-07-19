import { MapPin, SlidersHorizontal, CheckCircle2 } from "lucide-react";
import { AppRoute } from "../../app/App";
import { FooterBar } from "../../shared/components/FooterBar";
import { MarketplaceHeader } from "../../shared/components/MarketplaceHeader";
import { getCategories, getProfessionals } from "../../shared/api";
import { fallbackCategories, fallbackProfessionals } from "../../shared/data";
import { useAsyncData } from "../../shared/useAsyncData";

type Props = {
  onNavigate: (route: AppRoute) => void;
};

export function ProfessionalsPage({ onNavigate }: Props) {
  const { data: categories } = useAsyncData(getCategories, fallbackCategories);
  const { data: professionals } = useAsyncData(getProfessionals, fallbackProfessionals);

  return (
    <main className="marketplace-shell">
      <MarketplaceHeader active="professionals" onNavigate={onNavigate} />
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
      <FooterBar />
    </main>
  );
}
