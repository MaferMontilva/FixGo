import { Link } from "react-router-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "dark" | "wide" | "neutral";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  className?: string;
  to?: string;
  variant?: ButtonVariant;
};

const variantClass: Record<ButtonVariant, string> = {
  primary: "primary-pill",
  dark: "dark-pill",
  wide: "primary-wide",
  neutral: "primary-wide neutral"
};

export function Button({ children, className = "", to, type = "button", variant = "primary", ...props }: ButtonProps) {
  const composedClassName = [variantClass[variant], className].filter(Boolean).join(" ");

  if (to) {
    return (
      <Link className={composedClassName} to={to}>
        {children}
      </Link>
    );
  }

  return (
    <button className={composedClassName} type={type} {...props}>
      {children}
    </button>
  );
}
