import { RefreshCw, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ProfessionalNav } from "../../professionals";
import type { ApiError } from "../../../shared/types/apiError";
import { getMyReviews } from "../services/reviewsApi";
import type { Review } from "../types/review";

function Stars({ value }: { value: number }) {
  return (
    <span className="review-stars-static">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={16} fill={n <= value ? "currentColor" : "none"} className={n <= value ? "is-on" : ""} />
      ))}
    </span>
  );
}

export function ProfessionalReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setReviews(await getMyReviews());
      setError("");
    } catch (loadError) {
      setError((loadError as ApiError).message || "No pudimos cargar tus valoraciones.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  return (
    <main className="pro-dashboard-shell">
      <ProfessionalNav />
      <section className="pro-panel">
        <div className="orders-head">
          <div>
            <h1 className="pro-section-title">Mis valoraciones</h1>
            <p className="pro-helper-text">
              {reviews.length ? `Media: ${average.toFixed(1)} / 5 en ${reviews.length} valoraciones.` : "Aun no tienes valoraciones."}
            </p>
          </div>
          <button className="pro-link-button" type="button" onClick={() => void load()}><RefreshCw size={18} /> Actualizar</button>
        </div>

        {loading ? <p className="pro-empty-state">Cargando...</p> : null}
        {error ? <p className="pro-page-error" role="alert">{error}</p> : null}
        {!loading && !error && reviews.length === 0 ? (
          <p className="pro-empty-state">Cuando un cliente valore un trabajo completado, aparecera aqui.</p>
        ) : null}

        <div className="orders-list">
          {reviews.map((review) => (
            <article className="pro-request-card" key={review.id}>
              <div className="order-card-head">
                <h2>{review.authorName ?? "Cliente"}</h2>
                <Stars value={review.rating} />
              </div>
              {review.comment ? <p className="order-card-desc">{review.comment}</p> : null}
              {review.professionalReply ? <p className="budget-card-notes">Tu respuesta: {review.professionalReply}</p> : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
