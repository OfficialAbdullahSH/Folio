export function Paragraphs({ text }: { text: string }) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);

  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          dir="auto"
          className="mb-3 break-words leading-relaxed text-[var(--color-text)] last:mb-0"
        >
          {paragraph}
        </p>
      ))}
    </>
  );
}
