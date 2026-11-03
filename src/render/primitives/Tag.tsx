import type { ReactNode } from "react";

export function Tag({ children }: { children: ReactNode }) {
  return (
    <li
      dir="auto"
      className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-sm"
    >
      {children}
    </li>
  );
}
