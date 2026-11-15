/**
 * The app's shared class strings, defined once.
 *
 * Every value is a semantic token from the app palette in `src/app/globals.css`
 * (`canvas`, `panel`, `ink`, `ink-soft`, `rule`, `rule-strong`, `selected`, `cta`,
 * `danger`), so a screen cannot drift into one-off colours and every surface follows
 * the light or the dark theme without a second class name. Touch targets are 44px
 * (`min-h-11`), text is 16px on mobile so iOS does not zoom a field on focus, and
 * the focus ring is visible on both themes.
 */

export const INPUT =
  "w-full min-h-11 rounded-md border border-rule-strong bg-panel px-3 py-2 text-base text-ink shadow-xs placeholder:text-ink-soft focus-visible:border-cta focus-visible:ring-2 focus-visible:ring-cta/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-canvas";

export const INPUT_INVALID =
  "border-danger focus-visible:border-danger focus-visible:ring-danger/25";

export const LABEL = "text-sm font-medium text-ink";

export const HINT = "text-xs text-ink-soft";

export const ERROR = "text-sm font-medium text-danger";

export const COUNTER = "text-xs tabular-nums text-ink-soft";

export const BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-50";

export const BUTTON_PRIMARY = `${BUTTON} bg-cta text-cta-ink hover:bg-cta/90 active:bg-cta/80`;

export const BUTTON_SECONDARY = `${BUTTON} border border-rule-strong bg-panel text-ink hover:bg-canvas active:bg-rule`;

export const BUTTON_DANGER = `${BUTTON} border border-transparent px-2 text-danger hover:bg-danger-surface active:bg-danger-surface`;

export const ICON_BUTTON =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-rule-strong bg-panel text-ink transition-colors motion-reduce:transition-none hover:bg-canvas active:bg-rule focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-40";

export const CARD = "rounded-lg border border-rule bg-panel p-5 shadow-xs sm:p-6";

export const ITEM_CARD = "rounded-md border border-rule bg-canvas p-4";

export const CHIP =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-rule-strong bg-panel pl-4 pr-0.5 text-sm text-ink";

/* The app chrome: the header, the skip link and the workflow tab bar. */

export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 focus-visible:ring-offset-panel";

/** Clipped until it has focus, then a real 44px target at the top of the page. */
export const SKIP_LINK =
  "sr-only rounded-md bg-cta px-4 py-2 text-sm font-medium text-cta-ink focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

/** A header destination. The current one is marked with weight and a surface. */
export const NAV_LINK =
  "inline-flex min-h-11 items-center rounded-md px-3 text-sm text-ink-soft transition-colors motion-reduce:transition-none hover:bg-canvas hover:text-ink active:bg-selected focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 focus-visible:ring-offset-panel";

export const NAV_LINK_CURRENT = "bg-selected font-medium text-ink";

/** One step of the Content → Design → Preview bar. */
export const TAB =
  "inline-flex min-h-11 items-center border-b-2 border-transparent px-3 text-sm text-ink-soft transition-colors motion-reduce:transition-none hover:border-rule-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 focus-visible:ring-offset-panel";

export const TAB_CURRENT = "border-ink font-medium text-ink";
