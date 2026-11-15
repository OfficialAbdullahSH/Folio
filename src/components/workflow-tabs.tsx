"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/editor/lib/cn";
import { TAB, TAB_CURRENT } from "@/editor/lib/styles";
import { isCurrentPath, WORKFLOW_TABS } from "@/lib/navigation/model";

import { GuardedLink } from "./guarded-link";

/**
 * Content → Design → Preview (D-096). The three screens are one job, so they share a
 * bar that says where the owner is and makes the other two one click away. Every link
 * goes through the unsaved-changes guard.
 */
export function WorkflowTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Portfolio workflow" className="border-b border-rule bg-panel">
      <ul className="mx-auto flex w-full max-w-6xl gap-1 px-4 sm:px-6">
        {WORKFLOW_TABS.map((tab) => {
          const current = isCurrentPath(tab.href, pathname);

          return (
            <li key={tab.href}>
              <GuardedLink
                href={tab.href}
                aria-current={current ? "page" : undefined}
                className={cn(TAB, current && TAB_CURRENT)}
              >
                {tab.label}
              </GuardedLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
