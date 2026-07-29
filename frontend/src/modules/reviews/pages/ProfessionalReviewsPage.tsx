import { RefreshCw, Send, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ProfessionalNav } from "../../professionals";
import { AiPolishButton } from "../../ai";
import type { ApiError } from "../../../shared/types/apiError";
import { getMyReviews, replyToReview } from "../services/reviewsApi";
import type { Review } from "../types/review";

// Formulario para que el profesional responda (o edite su respuesta) a una valoración.
function ReplyBox({ review, onReplied }: { review: Review; onReplied: () => void }) {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState(review.professionalReply ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    const clean = reply.trim();
    if (clean.length < 2) {
      setError("La respuesta debe tener al menos 2 caracteres.");
      return;
    }
    setError("");
    try {
      setSaving(true);
      await replyToReview(review.id, clean);
      setOpen(false);
      onReplied();
    } catch (replyError) {
      setError((replyError as ApiError).message || "No pudimos guardar tu respuesta.");
    } finally {
      setSaving(false);
    }
  };

  if (review.professionalReply && !open) {
    return (
      <div className="review-card-reply">
        <strong>Tu respuesta</strong>
        <p>{review.professionalReply}</p>
        <button type="button" className="pro-link-button" onClick={() => setOpen(true)}>Editar respuesta</button>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" className="pro-link-button review-reply-open" onClick={() => setOpen(true)}>
        Responder valoración
      </button>
    );
  }

  return (
    <div className="review-reply-form">
      <textarea
        className="review-comment"
        rows={3}
        maxLength={1000}
        lang="es"
        spellCheck
        placeholder="Escribe tu respuesta al cliente..."
        value={reply}
        onChange={(event) => setReply(event.target.value)}
      />
      <AiPolishButton value={reply} onResult={setReply} style="professional-reply" label="Redactar con IA" />
      {error ? <p className="form-error server-error">{error}</p> : null}
      <div className="review-reply-actions">
        <button type="button" className="request-secondary-action" onClick={() => setOpen(false)} disabled={saving}>Cancelar</button>
        <button type="button" className="pro-primary-button" onClick={() => void submit()} disabled={saving}>
          <Send size={16} /> {saving ? "Enviando..." : "Enviar respuesta"}
        </button>
      </div>
    </div>
  );
}

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
              <ReplyBox review={review} onReplied={() => void load()} />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
