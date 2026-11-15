/**
 * The navigation model (D-095, D-096).
 *
 * One list of destinations for the header, one for the workflow tab bar and one for
 * the dashboard steps. The components read these, so a screen cannot invent a label
 * or a path and the tests can assert that every destination is reachable.
 */

export type NavItem = {
  href: string;
  label: string;
};

export const DASHBOARD_ITEM: NavItem = { href: "/dashboard", label: "Dashboard" };
export const CONTENT_ITEM: NavItem = { href: "/dashboard/edit", label: "Content" };
export const DESIGN_ITEM: NavItem = { href: "/dashboard/design", label: "Design" };
export const PREVIEW_ITEM: NavItem = { href: "/dashboard/preview", label: "Preview" };
export const SEARCH_ITEM: NavItem = { href: "/search", label: "Search" };

export const SIGNED_IN_NAV: readonly NavItem[] = [
  DASHBOARD_ITEM,
  CONTENT_ITEM,
  DESIGN_ITEM,
  PREVIEW_ITEM,
  SEARCH_ITEM,
];

export const SIGNED_OUT_NAV: readonly NavItem[] = [SEARCH_ITEM];

/** The three screens that are one job: writing, designing, looking (D-096). */
export const WORKFLOW_TABS: readonly NavItem[] = [CONTENT_ITEM, DESIGN_ITEM, PREVIEW_ITEM];

export type DashboardStep = NavItem & {
  description: string;
};

/** The dashboard's "what do I do now" order: write, then design, then publish. */
export const DASHBOARD_STEPS: readonly DashboardStep[] = [
  {
    href: "/dashboard/edit",
    label: "Content",
    description: "Write your name, headline, projects, skills, experience and contact links.",
  },
  {
    href: "/dashboard/design",
    label: "Design",
    description: "Pick a world, a look and your own colors, and watch the page change.",
  },
  {
    href: "/dashboard#publish",
    label: "Publish",
    description: "Copy the saved draft to your public link, and republish when you change it.",
  },
];

export function navFor(signedIn: boolean): readonly NavItem[] {
  return signedIn ? SIGNED_IN_NAV : SIGNED_OUT_NAV;
}

/**
 * A header link is current only on its own page. `/dashboard` is not current on
 * `/dashboard/edit`: the owner is in the editor, and marking two items at once makes
 * the marker meaningless.
 */
export function isCurrentPath(href: string, pathname: string): boolean {
  return pathOf(href) === pathOf(pathname);
}

function pathOf(value: string): string {
  return normalise(value.split(/[?#]/)[0] ?? "");
}

function normalise(path: string): string {
  const trimmed = path.replace(/\/+$/, "");

  return trimmed.length === 0 ? "/" : trimmed;
}
