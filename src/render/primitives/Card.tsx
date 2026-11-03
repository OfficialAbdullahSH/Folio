import type { ReactNode } from "react";

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="h-full rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      {children}
    </div>
  );
}
