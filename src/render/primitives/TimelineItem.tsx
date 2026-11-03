import type { ReactNode } from "react";

export function TimelineItem({ children }: { children: ReactNode }) {
  return (
    <li className="relative border-l border-[var(--color-border)] pl-6">
      <span
        aria-hidden="true"
        className="absolute -left-[5px] top-2 h-2 w-2 rounded-full bg-[var(--color-accent)]"
      />
      {children}
    </li>
  );
}
