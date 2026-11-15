"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

import { leaveDecision } from "@/lib/navigation/guard";

import { useUnsavedChanges } from "./unsaved-changes";

/**
 * A link that asks before it throws away unsaved work (D-098).
 *
 * It behaves exactly like `next/link` until there is something to lose. Modified
 * clicks (new tab, new window) are left to the browser: the current page stays, so
 * nothing is lost.
 */
export function GuardedLink({ href, onClick, ...rest }: ComponentProps<typeof Link>) {
  const { dirty, askLeave } = useUnsavedChanges();
  const pathname = usePathname();
  const router = useRouter();
  const target = typeof href === "string" ? href : String(href.pathname ?? "/");

  async function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    if (leaveDecision({ dirty, currentPath: pathname, href: target }) !== "confirm") {
      return;
    }

    event.preventDefault();

    if (await askLeave()) {
      router.push(target);
    }
  }

  return <Link {...rest} href={href} onClick={handleClick} />;
}
