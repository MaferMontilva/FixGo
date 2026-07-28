import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { InputHTMLAttributes } from "react";

type AuthFormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  wrapperClassName?: string;
};

export function AuthFormField({ label, error, id, type, wrapperClassName, ...props }: AuthFormFieldProps) {
  const isPassword = type === "password";
  const [visible, setVisible] = useState(false);
  const inputType = isPassword ? (visible ? "text" : "password") : type;

  return (
    <div className={wrapperClassName ? `auth-field ${wrapperClassName}` : "auth-field"}>
      <label htmlFor={id}>{label}</label>
      <div className={isPassword ? "auth-input-wrap has-toggle" : "auth-input-wrap"}>
        <input
          id={id}
          type={inputType}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            className="password-toggle"
            aria-label={visible ? "Ocultar contrasena" : "Mostrar contrasena"}
            onClick={() => setVisible((current) => !current)}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="form-error" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
