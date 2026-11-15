/**
 * The unsaved-changes rule (D-098), as a pure function.
 *
 * A link is intercepted only when there is something to lose and the destination is
 * a different page. In-page anchors, the page the owner is already on, and anything
 * that is not an app path are left alone: a confirmation that fires when nothing
 * changes trains the owner to dismiss it without reading.
 */

export type LeaveDecision = "allow" | "confirm";

export type LeaveCheck = {
  dirty: boolean;
  currentPath: string;
  href: string;
};

function normalise(path: string): string {
  const trimmed = path.replace(/\/+$/, "");

  return trimmed.length === 0 ? "/" : trimmed;
}

function pathOf(href: string): string {
  const [path] = href.split(/[?#]/);

  return normalise(path ?? "");
}

export function leaveDecision({ dirty, currentPath, href }: LeaveCheck): LeaveDecision {
  if (!dirty) {
    return "allow";
  }

  if (!href.startsWith("/")) {
    return "allow";
  }

  return pathOf(href) === normalise(currentPath) ? "allow" : "confirm";
}
