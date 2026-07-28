import { Star } from "lucide-react";
import { FormEvent, useState } from "react";
import type { ApiError } from "../../../shared/types/apiError";
import { createReview } from "../services/reviewsApi";

type ReviewFormProps = {
  serviceOrderId: number;
  onSubmitted?: () => void;
};

export function ReviewForm({ serviceOrderId, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setError("Selecciona una valoracion entre 1 y 5 estrellas.");
      return;
    }

    const trimmedComment = comment.trim();
    if (trimmedComment && trimmedComment.length < 3) {
      setError("El comentario debe tener al menos 3 caracteres.");
      return;
    }
    if (trimmedComment.length > 1000) {
      setError("El comentario no puede superar los 1000 caracteres.");
      return;
    }

    try {
      setSubmitting(true);
      await createReview({ serviceOrderId, rating, comment: trimmedComment || undefined });
      setDone(true);
      onSubmitted?.();
    } catch (submitError) {
      setError((submitError as ApiError).message || "No pudimos guardar tu valoracion.");
      setSubmitting(false);
    }
  };

  if (done) {
    return <p className="review-done">¡Gracias por tu valoracion!</p>;
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <span className="review-form-label">Valora el trabajo</span>
      <div className="review-stars" role="radiogroup" aria-label="Puntuacion">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            className={`review-star ${(hover || rating) >= value ? "is-on" : ""}`}
            onMouseEnter={() => setHover(value)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(value)}
            aria-label={`${value} estrellas`}
          >
            <Star size={22} fill={(hover || rating) >= value ? "currentColor" : "none"} />
          </button>
        ))}
      </div>
      <textarea
        className="review-comment"
        rows={2}
        maxLength={1000}
        placeholder="Cuenta como fue tu experiencia (opcional)"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />
      {error ? <p className="form-error server-error">{error}</p> : null}
      <button className="pro-primary-button" type="submit" disabled={submitting}>
        {submitting ? "Enviando..." : "Enviar valoracion"}
      </button>
    </form>
  );
}
