type RequestDraftNoticeProps = {
  canDiscard: boolean;
  message: string;
  onDiscard: () => void;
  savedAtText: string;
};

export function RequestDraftNotice({
  canDiscard,
  message,
  onDiscard,
  savedAtText
}: RequestDraftNoticeProps) {
  if (!message && !canDiscard) return null;

  return (
    <section className="request-draft-notice" aria-live="polite">
      <div>
        {message ? <p>{message}</p> : null}
        {savedAtText ? <span>{savedAtText}</span> : null}
      </div>
      {canDiscard ? (
        <button className="request-discard-button" onClick={onDiscard} type="button">
          Descartar borrador
        </button>
      ) : null}
    </section>
  );
}
