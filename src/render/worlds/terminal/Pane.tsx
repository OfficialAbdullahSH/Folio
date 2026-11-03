import type { ReactNode } from "react";

import type { SectionId } from "@/schema";

import { TerminalTitleBar } from "./TitleBar";

export function TerminalPane({
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
    <section id={id} data-section={id} data-style={style} className="tm-pane">
      <TerminalTitleBar title={`${id}.md`} />
      <div className="tm-pane-body">
        <h2 className="tm-section-heading">{title}</h2>
        {children}
      </div>
    </section>
  );
}
