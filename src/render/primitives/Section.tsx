import type { ReactNode } from "react";

import type { SectionId } from "@/schema";

export function Section({
  id,
  title,
  style,
  children,
}: {
  id: SectionId;
  title: string;
  style?: string;
  children: ReactNode;
}) {
  return (
    <section
      data-section={id}
      data-style={style}
      className="border-t border-[var(--color-border)] py-10"
    >
      <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)] [font-family:var(--font-heading)]">
        {title}
      </h2>
      {children}
    </section>
  );
}
