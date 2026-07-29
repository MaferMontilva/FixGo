import { CheckCircle2, MapPin, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fallbackCategories, getCategories } from "../../categories";
import { fallbackProfessionals } from "../data/professionalFallbacks";
import { getProfessionals } from "../services/professionalsApi";
import { useAsyncData } from "../../../shared/hooks/useAsyncData";

const normalize = (value: string) =>
  value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

export function ProfessionalsPage() {
  const { data: professionals } = useAsyncData(getProfessionals, fallbackProfessionals);
  const { data: categories } = useAsyncData(getCategories, fallbackCategories);
  const [query, setQuery] = useState("");

  const slugByTrade = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((category) => {
      if (category.slug) map.set(normalize(category.name), category.slug);
    });
    return map;
  }, [categories]);

  const requestLink = (trade: string | null | undefined) => {
    const slug = trade ? slugByTrade.get(normalize(trade)) : undefined;
    return slug ? `/cliente/solicitar-presupuesto?category=${slug}` : "/cliente/solicitar-presupuesto";
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return professionals.filter((professional) => {
      if (!q) return true;
      const name = (professional.name ?? "").toLowerCase();
      const trade = (professional.trade ?? "").toLowerCase();
      return name.includes(q) || trade.includes(q);
    });
  }, [professionals, query]);

  return (
    <>
      <section className="professionals-top">
        <h1>Encuentra tu profesional</h1>
        <p>Profesionales disponibles en la red FixGo</p>
        <div className="professional-search-row">
          <div className="search-field">
            <Search size={18} aria-hidden="true" />
            <input
              placeholder="Buscar por nombre o gremio..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="professionals-directory">
        {visible.length === 0 ? (
          <p className="professionals-empty">No encontramos profesionales para tu busqueda.</p>
        ) : (
          <div className="pro-directory-grid">
            {visible.map((professional) => (
              <article className="professional-card" key={professional.id ?? professional.name}>
                <div className="professional-cover">
                  <span>{professional.trade}</span>
                </div>
                <div className="professional-avatar">FG</div>
                <div className="professional-info">
                  <h3>
                    {professional.name} {professional.verified && <CheckCircle2 size={18} />}
                  </h3>
                  <p className="professional-rating">
                    <Star size={15} /> {professional.ratingAverage ? professional.ratingAverage.toFixed(1) : "Nuevo"}
                  </p>
                  <p>
                    <MapPin size={16} /> {professional.location}
                  </p>
                  <Link className="pro-card-cta" to={requestLink(professional.trade)}>
                    Pedir presupuesto
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
