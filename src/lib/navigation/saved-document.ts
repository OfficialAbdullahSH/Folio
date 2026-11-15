/**
 * The document the server holds, tracked beside the screen's own copy.
 *
 * Leave has to put back what is saved. The page's props are the server's render from
 * when the screen opened, and a save on that screen does not change them, so restoring
 * from the props would undo the last save. Instead the document a successful save sent
 * is remembered here, keyed by the revision the save action reports back: a result for a
 * revision this screen did not send is ignored, so a failed or stale save cannot become
 * the document Leave restores.
 */

export type SavedDocument<T> = {
  document: T;
  revision: number;
};

export type SavedDocumentState<T> = {
  saved: SavedDocument<T>;
  /** The document a submit sent, waiting for the action to report its revision. */
  sent: SavedDocument<T> | null;
};

export type SavedDocumentEvent<T> =
  | { type: "submit"; document: T; revision: number }
  | { type: "result"; revision: number | null };

export function initialSavedDocument<T>(document: T): SavedDocumentState<T> {
  return { saved: { document, revision: 0 }, sent: null };
}

export function savedDocumentReducer<T>(
  state: SavedDocumentState<T>,
  event: SavedDocumentEvent<T>,
): SavedDocumentState<T> {
  switch (event.type) {
    case "submit":
      return { ...state, sent: { document: event.document, revision: event.revision } };
    case "result": {
      const sent = state.sent;

      if (event.revision === null || sent === null || sent.revision !== event.revision) {
        return state;
      }

      return { saved: sent, sent: null };
    }
  }
}
