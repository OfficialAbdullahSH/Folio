"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/editor/lib/cn";
import {
  BUTTON_PRIMARY,
  FOCUS_RING,
  NAV_LINK,
  NAV_LINK_CURRENT,
  SKIP_LINK,
} from "@/editor/lib/styles";
import { logoutAction } from "@/lib/auth/actions";
import { isCurrentPath, navFor, type NavItem } from "@/lib/navigation/model";

import { GuardedLink } from "./guarded-link";
import { ThemeControl } from "./theme-control";
import { useUnsavedChanges } from "./unsaved-changes";

export type HeaderBarProps = {
  signedIn: boolean;
  displayName: string | null;
  username: string | null;
};

/**
 * The one header every app screen has (D-095).
 *
 * Brand, the destinations that exist for this visitor, the theme control and the
 * account. Below `md` the destinations and the theme control move into a menu panel:
 * they do not fit on a phone without shrinking the targets below 44px.
 */
export function HeaderBar({ signedIn, displayName, username }: HeaderBarProps) {
  const pathname = usePathname();
  // The menu records the path it was opened on, so a navigation closes it without an
  // effect: on the new path the two no longer match, and it reads as closed.
  const [menuPathname, setMenuPathname] = useState<string | null>(null);
  const menuOpen = menuPathname === pathname;
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const items = navFor(signedIn);
  const homeHref = signedIn ? "/dashboard" : "/";

  // Escape closes the panel and puts focus back on the button that opened it, so a
  // keyboard user is not dropped at the top of the document.
  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuPathname(null);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-panel">
      {/* The first thing in the tab order, and inside the banner landmark (D-103). */}
      <a href="#main-content" className={SKIP_LINK}>
        Skip to content
      </a>
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-2 sm:px-6">
        <GuardedLink
          href={homeHref}
          className={cn(
            "inline-flex min-h-11 items-center rounded-md px-2 text-base font-semibold tracking-tight text-ink",
            FOCUS_RING,
          )}
        >
          Folio
        </GuardedLink>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Below md the theme control moves into the menu panel with the destinations
              (D-103): brand, three theme buttons, the account and the menu button are
              57px wider than a 375px phone, and the header scrolled sideways. */}
          <div className="hidden md:block">
            <ThemeControl />
          </div>

          {signedIn ? (
            <AccountMenu displayName={displayName ?? "Your account"} username={username} />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <GuardedLink href="/login" className={cn(NAV_LINK, "px-3")}>
                Log in
              </GuardedLink>
              <GuardedLink href="/signup" className={cn(BUTTON_PRIMARY, "px-3")}>
                Sign up
              </GuardedLink>
            </div>
          )}

          <button
            ref={menuButtonRef}
            aria-expanded={menuOpen}
            aria-controls="app-menu"
            onClick={() => setMenuPathname(menuOpen ? null : pathname)}
            className={cn(
              "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-rule-strong bg-panel text-ink md:hidden",
              FOCUS_RING,
            )}
          >
            {menuOpen ? (
              <X aria-hidden className="size-5" />
            ) : (
              <Menu aria-hidden className="size-5" />
            )}
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div id="app-menu" className="border-t border-rule px-4 py-3 md:hidden">
          <nav aria-label="Menu" className="flex flex-col gap-1">
            {items.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} block />
            ))}
          </nav>

          <div className="mt-3 border-t border-rule pt-3 md:hidden">
            <ThemeControl />
          </div>

          <div className="mt-3 flex flex-col gap-1 border-t border-rule pt-3">
            {signedIn ? (
              <LogOutForm />
            ) : (
              <>
                <GuardedLink href="/login" className={cn(NAV_LINK, "px-3")}>
                  Log in
                </GuardedLink>
                <GuardedLink href="/signup" className={cn(NAV_LINK, "px-3")}>
                  Sign up
                </GuardedLink>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function NavLink({
  item,
  pathname,
  block = false,
}: {
  item: NavItem;
  pathname: string;
  block?: boolean;
}) {
  const current = isCurrentPath(item.href, pathname);

  return (
    <GuardedLink
      href={item.href}
      aria-current={current ? "page" : undefined}
      className={cn(NAV_LINK, block && "w-full", current && NAV_LINK_CURRENT)}
    >
      {item.label}
    </GuardedLink>
  );
}

function AccountMenu({
  displayName,
  username,
}: {
  displayName: string;
  username: string | null;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (containerRef.current !== null && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    // Escape closes the panel and returns focus to its button: the log-out button the
    // focus was on disappears with the panel, so focus would otherwise fall to the body.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="account-menu"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex min-h-11 max-w-40 items-center gap-1 rounded-md border border-rule-strong bg-panel px-2.5 text-sm text-ink hover:bg-canvas",
          FOCUS_RING,
        )}
      >
        <span className="truncate">{displayName}</span>
        <ChevronDown aria-hidden className="size-4 shrink-0" />
        <span className="sr-only">Account menu</span>
      </button>

      {open ? (
        <div
          id="account-menu"
          className="absolute right-0 z-40 mt-2 w-60 rounded-lg border border-rule bg-panel p-2 shadow-lg"
        >
          <p className="truncate px-3 pt-2 text-sm font-medium text-ink">{displayName}</p>
          {username === null ? null : (
            <p className="truncate px-3 pb-2 text-xs text-ink-soft">@{username}</p>
          )}
          <LogOutForm />
        </div>
      ) : null}
    </div>
  );
}

/**
 * Logging out is not a link, but it still throws the page away, so it asks the same
 * question when the editor has unsaved work. `bypass` lets the second submit through
 * after the owner has agreed.
 */
function LogOutForm() {
  const { dirty, askLeave } = useUnsavedChanges();
  const bypass = useRef(false);

  return (
    <form
      action={logoutAction}
      onSubmit={async (event) => {
        if (bypass.current) {
          bypass.current = false;

          return;
        }

        if (!dirty) {
          return;
        }

        event.preventDefault();

        const form = event.currentTarget;

        if (await askLeave()) {
          bypass.current = true;
          form.requestSubmit();
        }
      }}
    >
      <button
        type="submit"
        className={cn(NAV_LINK, "w-full justify-start px-3 text-ink")}
      >
        Log out
      </button>
    </form>
  );
}
