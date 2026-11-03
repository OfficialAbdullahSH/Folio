import type { ReactNode } from "react";

import type { SectionId } from "@/schema";

export function EditorialSection({
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
    <section id={id} data-section={id} data-style={style} className="ed-section">
      <div className="ed-section-margin">
        <span className="ed-section-number" data-decor="number" aria-hidden="true" />
      </div>
      <div className="ed-section-body">
        <h2 className="ed-section-heading">{title}</h2>
        {children}
      </div>
    </section>
  );
}
