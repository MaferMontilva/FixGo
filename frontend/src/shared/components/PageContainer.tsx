import type { HTMLAttributes, ReactNode } from "react";

type PageContainerProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  className?: string;
};

export function PageContainer({ children, className = "", ...props }: PageContainerProps) {
  return (
    <section className={className} {...props}>
      {children}
    </section>
  );
}
