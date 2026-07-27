import type { InputHTMLAttributes } from "react";

type AuthFormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function AuthFormField({ label, error, id, ...props }: AuthFormFieldProps) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props} />
      {error ? (
        <p className="form-error" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
