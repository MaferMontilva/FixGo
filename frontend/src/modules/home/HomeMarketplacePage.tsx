import { AppRoute } from "../../app/App";
import { FooterBar } from "../../shared/components/FooterBar";
import { MarketplaceHeader } from "../../shared/components/MarketplaceHeader";
import { SearchBox } from "../../shared/components/SearchBox";
import { getCategories } from "../../shared/api";
import { fallbackCategories } from "../../shared/data";
import { useAsyncData } from "../../shared/useAsyncData";

type Props = {
  onNavigate: (route: AppRoute) => void;
};

export function HomeMarketplacePage({ onNavigate }: Props) {
  const { data: categories } = useAsyncData(getCategories, fallbackCategories);

  return (
    <main className="marketplace-shell">
      <MarketplaceHeader active="home" onNavigate={onNavigate} />
      <section className="marketplace-hero">
        <h1>Tu hogar, nuestro proyecto</h1>
        <p>Elige el servicio de instalacion, mantenimiento o reforma que necesitas</p>
        <SearchBox placeholder="Escribe lo que necesitas..." />
      </section>
      <section className="content-section">
        <h2>Servicios de temporada</h2>
        <p>Adapta tu hogar para los meses de mas calor</p>
        <div className="season-grid">
          {categories.slice(0, 3).map((category) => {
            const Icon = category.icon;
            return (
              <button className="season-card" key={category.name} onClick={() => onNavigate("request")}>
                <Icon size={44} />
                <strong>{category.name}</strong>
              </button>
            );
          })}
        </div>
      </section>
      <FooterBar />
    </main>
  );
}
