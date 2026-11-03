import type { ReactNode } from "react";

export function TimelineItem({ children }: { children: ReactNode }) {
  return (
    <li className="relative border-s border-[var(--color-border)] ps-6">
      <span
        aria-hidden="true"
        className="absolute -start-[5px] top-2 h-2 w-2 rounded-full bg-[var(--color-accent)]"
      />
      {children}
    </li>
  );
}
