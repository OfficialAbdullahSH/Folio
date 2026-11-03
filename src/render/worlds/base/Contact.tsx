import { ExternalLink } from "../../primitives/ExternalLink";
import { Section } from "../../primitives/Section";
import type { SectionProps } from "../types";

export function Contact({ section, content }: SectionProps) {
  if (section.id !== "contact") {
    return null;
  }

  const items = content.contact.items;

  if (items.length === 0) {
    return null;
  }

  return (
    <Section id="contact" title="Contact">
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id}>
            {item.kind === "email" ? (
              <a
                href={`mailto:${item.value}`}
                dir="auto"
                className="break-words text-[var(--color-accent)] underline underline-offset-2"
              >
                {item.label}
              </a>
            ) : (
              <ExternalLink href={item.value}>{item.label}</ExternalLink>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}
