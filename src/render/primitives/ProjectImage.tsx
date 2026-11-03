export function ProjectImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- D-039: plain lazy image, no remote-domain config in v1
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`w-full rounded-[var(--radius)] border border-[var(--color-border)] object-cover ${className ?? ""}`}
    />
  );
}
