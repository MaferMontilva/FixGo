type RequestStepActionsProps = {
  canContinue?: boolean;
  continueLabel?: string;
  onBack?: () => void;
  onContinue?: () => void;
};

export function RequestStepActions({
  canContinue = true,
  continueLabel = "Continuar",
  onBack,
  onContinue
}: RequestStepActionsProps) {
  return (
    <div className="request-step-actions">
      {onBack ? (
        <button className="request-secondary-action" onClick={onBack} type="button">
          Atrás
        </button>
      ) : null}
      {onContinue ? (
        <button className="primary-wide" disabled={!canContinue} onClick={onContinue} type="button">
          {continueLabel}
        </button>
      ) : null}
    </div>
  );
}
