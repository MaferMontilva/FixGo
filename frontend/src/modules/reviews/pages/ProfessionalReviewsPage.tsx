import { RefreshCw, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ProfessionalNav } from "../../professionals";
import type { ApiError } from "../../../shared/types/apiError";
import { getMyReviews } from "../services/reviewsApi";
import type { Review } from "../types/review";

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="review-stars-static">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} fill={n <= Math.round(value) ? "currentColor" : "none"} className={n <= Math.round(value) ? "is-on" : ""} />
      ))}
    </span>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "";
  }
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
            <p className="pro-helper-text">Lo que opinan tus clientes sobre los trabajos que has realizado.</p>
          </div>
          <button className="pro-link-button" type="button" onClick={() => void load()}><RefreshCw size={18} /> Actualizar</button>
        </div>

        {reviews.length ? (
          <div className="reviews-summary">
            <div className="reviews-summary-score">
              <strong>{average.toFixed(1)}</strong>
              <span>de 5</span>
            </div>
            <div className="reviews-summary-meta">
              <Stars value={average} size={22} />
              <p>{reviews.length} {reviews.length === 1 ? "valoración recibida" : "valoraciones recibidas"}</p>
            </div>
          </div>
        ) : null}

        {loading ? <p className="pro-empty-state">Cargando...</p> : null}
        {error ? <p className="pro-page-error" role="alert">{error}</p> : null}
        {!loading && !error && reviews.length === 0 ? (
          <p className="pro-empty-state">Cuando un cliente valore un trabajo completado, aparecerá aquí.</p>
        ) : null}

        <div className="reviews-list">
          {reviews.map((review) => (
            <article className="review-card" key={review.id}>
              <div className="review-card-top">
                <div className="review-card-author">
                  <span className="review-avatar">{(review.authorName ?? "C").charAt(0).toUpperCase()}</span>
                  <div>
                    <strong>{review.authorName ?? "Cliente"}</strong>
                    <span className="review-card-date">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
                <Stars value={review.rating} />
              </div>
              {review.comment ? <p className="review-card-comment">“{review.comment}”</p> : null}
              {review.professionalReply ? (
                <div className="review-card-reply">
                  <strong>Tu respuesta</strong>
                  <p>{review.professionalReply}</p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
