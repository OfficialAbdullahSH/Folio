import { ExternalLink } from "../../primitives/ExternalLink";
import { CONTACT_KIND_LABELS } from "../labels";
import type { SectionProps } from "../types";
import { EditorialSection } from "./Section";

export function EditorialContact({ section, content }: SectionProps) {
  if (section.id !== "contact") {
    return null;
  }

  const items = content.contact.items;

  if (items.length === 0) {
    return null;
  }

  return (
    <EditorialSection id="contact" title="Contact">
      <ul className="ed-contact">
        {items.map((item) => (
          <li key={item.id} className="ed-contact-item">
            <p className="ed-contact-kind">{CONTACT_KIND_LABELS[item.kind]}</p>
            {item.kind === "email" ? (
              <a
                href={`mailto:${item.value}`}
                dir="auto"
                className="ed-contact-link break-words"
              >
                {item.label}
              </a>
            ) : (
              <ExternalLink href={item.value} className="ed-contact-link">
                {item.label}
              </ExternalLink>
            )}
          </li>
        ))}
      </ul>
    </EditorialSection>
  );
}
