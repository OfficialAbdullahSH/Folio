/**
 * The next-step links (X-01).
 *
 * Finishing a job on Content or Design should not leave the owner on a screen they are
 * done with, so the saved screen offers the next one. The links appear only once a save
 * has succeeded and nothing has been edited since: offering to move on while the screen
 * holds an unsaved document would either lose the edit or make the owner answer the
 * guard immediately after being invited to move.
 */

export type NextStep = {
  href: string;
  label: string;
};

export type NextStepScreen = "editor" | "builder";

export const EDITOR_NEXT_STEPS: readonly NextStep[] = [
  { href: "/dashboard/design", label: "Next: design your portfolio" },
  { href: "/dashboard/preview", label: "Preview" },
];

export const BUILDER_NEXT_STEPS: readonly NextStep[] = [
  { href: "/dashboard/preview", label: "Next: preview" },
  { href: "/dashboard#publish", label: "Publish" },
];

/** The preview page always offers publishing: it has nothing to save. */
export const PREVIEW_NEXT_STEP: NextStep = {
  href: "/dashboard#publish",
  label: "Next: publish",
};

export type ScreenSaveState = {
  status: "idle" | "pending" | "saved" | "error";
  dirty: boolean;
};

/** Empty unless the last save succeeded and nothing has changed since. */
export function nextStepsFor(
  screen: NextStepScreen,
  save: ScreenSaveState,
): readonly NextStep[] {
  if (save.status !== "saved" || save.dirty) {
    return [];
  }

  return screen === "editor" ? EDITOR_NEXT_STEPS : BUILDER_NEXT_STEPS;
}
