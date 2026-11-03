import type { SectionProps } from "../types";

export function Hero({ section, profile }: SectionProps) {
  if (section.id !== "hero") {
    return null;
  }

  const large = section.displayStyle === "large";

  return (
    <header
      data-section="hero"
      data-style={section.displayStyle}
      className={large ? "pb-12 pt-16" : "pb-8 pt-10"}
    >
      <h1
        dir="auto"
        className={`break-words [font-family:var(--font-heading)] font-semibold leading-tight ${
          large ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl"
        }`}
      >
        {profile.displayName}
      </h1>
      {profile.headline.trim().length > 0 ? (
        <p
          dir="auto"
          className={`mt-3 break-words text-[var(--color-muted)] ${
            large ? "text-lg" : "text-base"
          }`}
        >
          {profile.headline}
        </p>
      ) : null}
    </header>
  );
}
