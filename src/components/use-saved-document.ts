"use client";

import { useCallback, useReducer } from "react";

import {
  initialSavedDocument,
  savedDocumentReducer,
  type SavedDocument,
} from "@/lib/navigation/saved-document";

/**
 * The document the server has, kept beside the screen's own copy (D-104).
 *
 * Leave has to put back what is saved, and the page's props are the server's render from
 * when the screen opened: a save on that screen does not change them. So the screen
 * reports what it sent, and what the action reported back, and this keeps the last
 * document the server accepted. A screen with unsaved work restores from it when the
 * owner leaves.
 */
export function useSavedDocument<T>(initial: T): {
  saved: SavedDocument<T>;
  remember: (document: T, revision: number) => void;
  reportSaved: (revision: number | null) => void;
} {
  const [state, dispatch] = useReducer(savedDocumentReducer<T>, initial, initialSavedDocument);

  const remember = useCallback((document: T, revision: number) => {
    dispatch({ type: "submit", document, revision });
  }, []);

  const reportSaved = useCallback((revision: number | null) => {
    dispatch({ type: "result", revision });
  }, []);

  return { saved: state.saved, remember, reportSaved };
}
