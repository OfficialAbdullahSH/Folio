"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

import { ThemeProvider } from "@/lib/theme/theme-provider";

import { UnsavedChangesProvider } from "./unsaved-changes";

/**
 * What every app screen has around it (D-095): the theme, the unsaved-changes guard,
 * the header, and a focus move after navigation.
 *
 * The focus move is the part that is easy to forget. A client-side navigation keeps
 * the focus where the clicked link was, so a keyboard user tabs from the header again
 * on every page. Focusing `<main>` puts them at the start of the new content.
 *
 * The skip link lives in the header (`header-bar.tsx`) and not here: it has to be the
 * first thing in the tab order, and it has to sit inside a landmark, or a screen reader
 * user meets a link outside every region of the page.
 */
export function AppShell({ header, children }: { header: ReactNode; children: ReactNode }) {
  return (
    <ThemeProvider>
      <UnsavedChangesProvider>
        <RouteFocus />
        {header}
        {children}
      </UnsavedChangesProvider>
    </ThemeProvider>
  );
}

function RouteFocus() {
  const pathname = usePathname();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;

      return;
    }

    const main = document.querySelector("main");

    if (main === null) {
      return;
    }

    main.setAttribute("tabindex", "-1");
    main.focus();
  }, [pathname]);

  return null;
}
