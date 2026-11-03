import { ExternalLink } from "../../primitives/ExternalLink";
import { CONTACT_KIND_LABELS } from "../labels";
import type { SectionProps } from "../types";
import { TerminalPane } from "./Pane";

export function TerminalContact({ section, content }: SectionProps) {
  if (section.id !== "contact") {
    return null;
  }

  const items = content.contact.items;

  if (items.length === 0) {
    return null;
  }

  return (
    <TerminalPane id="contact" title="Contact">
      <dl className="tm-contact">
        {items.map((item) => (
          <div key={item.id} className="tm-contact-row">
            <dt className="tm-contact-key">{CONTACT_KIND_LABELS[item.kind]}</dt>
            <dd className="tm-contact-value">
              {item.kind === "email" ? (
                <a
                  href={`mailto:${item.value}`}
                  dir="auto"
                  className="tm-contact-link break-words"
                >
                  {item.label}
                </a>
              ) : (
                <ExternalLink href={item.value} className="tm-contact-link">
                  {item.label}
                </ExternalLink>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </TerminalPane>
  );
}
