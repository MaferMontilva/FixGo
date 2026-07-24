type RequestStep = 1 | 2 | 3 | 4;

type RequestStepIndicatorProps = {
  currentStep: RequestStep;
};

const requestSteps: Array<{ number: RequestStep; label: string }> = [
  { number: 1, label: "Servicio" },
  { number: 2, label: "Descripción" },
  { number: 3, label: "Datos del trabajo" },
  { number: 4, label: "Revisión" }
];

export function RequestStepIndicator({ currentStep }: RequestStepIndicatorProps) {
  return (
    <nav aria-label="Progreso de la solicitud" className="request-step-indicator">
      <span className="sr-only">Paso {currentStep} de 4</span>
      <ol className="request-step-list">
        {requestSteps.map((step) => {
          const isActive = step.number === currentStep;
          const isComplete = step.number < currentStep;

          return (
            <li
              aria-current={isActive ? "step" : undefined}
              className={[
                "request-step-item",
                isActive ? "is-active" : "",
                isComplete ? "is-complete" : ""
              ].filter(Boolean).join(" ")}
              key={step.number}
            >
              <span className="request-step-marker" aria-hidden="true">
                {isComplete ? "✓" : step.number}
              </span>
              <span className="request-step-text">
                <span>Paso {step.number}</span>
                <strong>{step.label}</strong>
                {isComplete ? <em>Completado</em> : null}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
