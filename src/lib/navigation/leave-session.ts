/**
 * The unsaved-changes session (D-098, D-104), as a pure reducer.
 *
 * Two things live here: whether the visible screen holds unsaved work, and a token that
 * counts the owner's decisions to leave. The token is what makes Leave mean discard.
 * Next keeps a route the owner left mounted but hidden, so its client state survives a
 * navigation; a screen that watches this token can put the saved document back at the
 * moment the owner leaves, which no amount of clearing a flag in the provider can do for
 * it.
 */

export type LeaveSession = {
  dirty: boolean;
  /** Bumped by every Leave decision. A screen rebuilds itself when it changes. */
  discardToken: number;
};

export type LeaveEvent =
  | { type: "setDirty"; dirty: boolean }
  | { type: "leave" };

export const NO_LEAVE_SESSION: LeaveSession = { dirty: false, discardToken: 0 };

export function leaveSession(state: LeaveSession, event: LeaveEvent): LeaveSession {
  switch (event.type) {
    case "setDirty":
      return state.dirty === event.dirty ? state : { ...state, dirty: event.dirty };
    case "leave":
      return { dirty: false, discardToken: state.discardToken + 1 };
  }
}
