import type { SectionProps } from "../types";
import { TerminalTitleBar } from "./TitleBar";

export function TerminalHero({ section, profile }: SectionProps) {
  if (section.id !== "hero") {
    return null;
  }

  const headline =
    profile.headline.trim().length > 0 ? (
      <p dir="auto" className="tm-hero-headline break-words">
        {profile.headline}
      </p>
    ) : null;

  if (section.displayStyle === "compact") {
    return (
      <header
        id="hero"
        data-section="hero"
        data-style="compact"
        className="tm-hero tm-hero-compact"
      >
        <p className="tm-prompt" data-decor="prompt" aria-hidden="true">
          $
        </p>
        <h1 dir="auto" className="tm-hero-name break-words">
          {profile.displayName}
        </h1>
        {headline}
      </header>
    );
  }

  return (
    <header
      id="hero"
      data-section="hero"
      data-style="large"
      className="tm-hero tm-hero-large tm-pane"
    >
      <TerminalTitleBar title="~/portfolio" />
      <div className="tm-pane-body tm-hero-body">
        <p className="tm-prompt" data-decor="prompt" aria-hidden="true">
          $ whoami
        </p>
        <h1 dir="auto" className="tm-hero-name break-words">
          {profile.displayName}
        </h1>
        {headline ? (
          <p className="tm-prompt" data-decor="prompt" aria-hidden="true">
            $ cat headline.txt
          </p>
        ) : null}
        {headline}
      </div>
    </header>
  );
}
