import type { ShellProps } from "../types";

export function EditorialShell({ profile, navigation, children }: ShellProps) {
  return (
    <>
      <a href="#main-content" className="ed-skip">
        Skip to content
      </a>
      <header data-nav="masthead" className="ed-masthead">
        <div className="ed-masthead-inner">
          <p className="ed-masthead-name" dir="auto">
            {profile.displayName}
          </p>
          {navigation.length > 0 ? (
            <nav aria-label="Sections" className="ed-index">
              <details open className="ed-index-menu">
                <summary className="ed-index-summary">Index</summary>
                <ol className="ed-index-list">
                  {navigation.map((item) => (
                    <li key={item.id} className="ed-index-item">
                      <a href={`#${item.id}`} className="ed-index-link">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            </nav>
          ) : null}
        </div>
      </header>
      <main id="main-content" className="ed-main">
        {children}
      </main>
    </>
  );
}
