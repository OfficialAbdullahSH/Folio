"use client";

import type { ReactNode } from "react";

import { cn } from "../lib/cn";
import { CARD } from "../lib/styles";

export function EditorSection({
  id,
  title,
  description,
  action,
  children,
}: {
  id: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className={cn(CARD, "flex flex-col gap-5")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id={`${id}-heading`} className="text-lg font-semibold text-ink">
            {title}
          </h2>
          <p className="max-w-prose text-sm text-ink-soft">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** The "there is nothing here yet" state every list needs (AC-14). */
export function EmptyList({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-rule-strong bg-canvas px-4 py-6 text-center text-sm text-ink-soft">
      {children}
    </p>
  );
}
