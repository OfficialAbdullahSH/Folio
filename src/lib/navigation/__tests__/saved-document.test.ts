import { describe, expect, it } from "vitest";

import {
  initialSavedDocument,
  savedDocumentReducer,
  type SavedDocumentState,
} from "../saved-document";

const saved = initialSavedDocument({ look: "editorial" });

function submit(state: SavedDocumentState<{ look: string }>, look: string, revision: number) {
  return savedDocumentReducer(state, {
    type: "submit",
    document: { look },
    revision,
  });
}

function result(state: SavedDocumentState<{ look: string }>, revision: number | null) {
  return savedDocumentReducer(state, { type: "result", revision });
}

describe("the saved document", () => {
  it("AC-6 starts from the document the server rendered", () => {
    expect(saved.saved).toEqual({ document: { look: "editorial" }, revision: 0 });
    expect(saved.sent).toBeNull();
  });

  it("AC-6 replaces it with the document a successful save sent", () => {
    const after = result(submit(saved, "neon", 1), 1);

    expect(after.saved).toEqual({ document: { look: "neon" }, revision: 1 });
    expect(after.sent).toBeNull();
  });

  it("AC-6 keeps the saved document while the save has not reported back", () => {
    expect(submit(saved, "neon", 1).saved).toEqual(saved.saved);
  });

  it("AC-6 ignores a result for a revision this screen did not send", () => {
    const after = result(submit(saved, "neon", 1), 7);

    expect(after.saved).toEqual(saved.saved);
    expect(after.sent).not.toBeNull();
  });

  it("AC-6 keeps the saved document when the save fails", () => {
    const after = result(submit(saved, "neon", 1), null);

    expect(after.saved).toEqual(saved.saved);
  });

  it("AC-6 records the second save, not the first", () => {
    const first = result(submit(saved, "neon", 1), 1);
    const second = result(submit(first, "terminal", 2), 2);

    expect(second.saved).toEqual({ document: { look: "terminal" }, revision: 2 });
  });

  it("AC-6 ignores a stale result that arrives after a newer submit", () => {
    const after = result(submit(submit(saved, "neon", 1), "terminal", 2), 1);

    expect(after.saved).toEqual(saved.saved);
    expect(after.sent).toEqual({ document: { look: "terminal" }, revision: 2 });
  });
});
