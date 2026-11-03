import type { SectionProps } from "../types";

export function EditorialHero({ section, profile }: SectionProps) {
  if (section.id !== "hero") {
    return null;
  }

  const large = section.displayStyle === "large";

  return (
    <div
      id="hero"
      data-section="hero"
      data-style={section.displayStyle}
      className={large ? "ed-hero ed-hero-large" : "ed-hero ed-hero-compact"}
    >
      <h1 dir="auto" className="ed-hero-name break-words">
        {profile.displayName}
      </h1>
      {profile.headline.trim().length > 0 ? (
        <p dir="auto" className="ed-hero-deck break-words">
          {profile.headline}
        </p>
      ) : null}
    </div>
  );
}
