export function TerminalTitleBar({ title }: { title: string }) {
  return (
    <div className="tm-titlebar" data-decor="titlebar" aria-hidden="true">
      <span className="tm-dots">
        <span data-decor="dot" aria-hidden="true" className="tm-dot rounded-full" />
        <span data-decor="dot" aria-hidden="true" className="tm-dot rounded-full" />
        <span data-decor="dot" aria-hidden="true" className="tm-dot rounded-full" />
      </span>
      <span className="tm-title">{title}</span>
    </div>
  );
}
