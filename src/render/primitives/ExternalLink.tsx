import type { ReactNode } from "react";

export function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      dir="auto"
      className="break-words text-[var(--color-accent)] underline underline-offset-2"
    >
      {children}
    </a>
  );
}
