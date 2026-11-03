import type { ShellProps } from "../types";

export function TerminalShell({ profile, navigation, children }: ShellProps) {
  return (
    <>
      <a href="#main-content" className="tm-skip">
        Skip to content
      </a>
      <header className="tm-topbar">
        <p className="tm-brand" data-decor="brand" aria-hidden="true">
          <span className="tm-dots">
            <span data-decor="dot" aria-hidden="true" className="tm-dot rounded-full" />
            <span data-decor="dot" aria-hidden="true" className="tm-dot rounded-full" />
            <span data-decor="dot" aria-hidden="true" className="tm-dot rounded-full" />
          </span>
          <span className="tm-brand-path">~/portfolio</span>
        </p>
        <p className="tm-user" dir="auto">
          {profile.username}
        </p>
      </header>
      <div className="tm-shell" data-nav="sidebar">
        <aside className="tm-sidebar">
          {navigation.length > 0 ? (
            <nav aria-label="Sections" className="tm-explorer">
              <p className="tm-explorer-label" data-decor="label" aria-hidden="true">
                explorer
              </p>
              <ol className="tm-files">
                {navigation.map((item) => (
                  <li key={item.id} className="tm-file">
                    <a href={`#${item.id}`} className="tm-file-link">
                      <span className="tm-file-index" data-decor="index" aria-hidden="true">
                        {String(item.index).padStart(2, "0")}
                      </span>
                      <span className="tm-file-name">{item.label.toLowerCase()}.md</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
        </aside>
        <main id="main-content" className="tm-main">
          {children}
        </main>
      </div>
    </>
  );
}
