import { describe, expect, it } from "vitest";

import { leaveSession, NO_LEAVE_SESSION } from "@/lib/navigation/leave-session";
import {
  initialSavedDocument,
  savedDocumentReducer,
  type SavedDocumentState,
} from "@/lib/navigation/saved-document";
import { defaultDesign } from "@/portfolio/defaults";
import type { DesignDocument } from "@/schema";

import { designReducer } from "../reducer";

/**
 * AC-6, at the level where the cause lives.
 *
 * Next keeps the route the owner left mounted but hidden, so the builder's own state
 * outlives a navigation. These are the pieces the builder is built from, driven in the
 * order the screen drives them: its reducer, the saved document the server holds, and the
 * session that counts Leave decisions. What Leave has to produce is the saved design, not
 * the page props and not the discarded edit.
 */
type Screen = {
  design: DesignDocument;
  /** What the screen restores from when the owner leaves. */
  saved: SavedDocumentState<DesignDocument>;
  session: typeof NO_LEAVE_SESSION;
  /** The screen's own counter, the same one the payload carries. */
  revision: number;
};

function open(design: DesignDocument): Screen {
  return { design, saved: initialSavedDocument(design), session: NO_LEAVE_SESSION, revision: 0 };
}

function edit(screen: Screen, radius: "sm" | "lg"): Screen {
  const design = designReducer(screen.design, { type: "setRadius", radius });

  if (design === screen.design) {
    return screen;
  }

  return {
    ...screen,
    design,
    revision: screen.revision + 1,
    session: leaveSession(screen.session, { type: "setDirty", dirty: true }),
  };
}

function save(screen: Screen, accepted: boolean): Screen {
  const sent = savedDocumentReducer(screen.saved, {
    type: "submit",
    document: screen.design,
    revision: screen.revision,
  });
  const saved = savedDocumentReducer(sent, {
    type: "result",
    revision: accepted ? screen.revision : null,
  });

  return {
    ...screen,
    saved,
    session: leaveSession(screen.session, { type: "setDirty", dirty: !accepted }),
  };
}

function leave(screen: Screen): Screen {
  const session = leaveSession(screen.session, { type: "leave" });

  // What the builder does when the token changes: it is rebuilt from the saved design.
  return { design: screen.saved.saved.document, saved: screen.saved, session, revision: 0 };
}

describe("the builder after Leave (AC-6)", () => {
  it("shows the saved design and no unsaved changes", () => {
    const savedDesign = edit(open(defaultDesign()), "sm");
    const after = leave(edit(save(savedDesign, true), "lg"));

    expect(after.design).toEqual(savedDesign.design);
    expect(after.design.theme.radius).toBe("sm");
    expect(after.session.dirty).toBe(false);
  });

  it("restores what the last save wrote, not the design the page opened with", () => {
    const opened = defaultDesign();
    const savedDesign = edit(open(opened), "lg");
    const after = leave(edit(save(savedDesign, true), "sm"));

    expect(after.design).not.toEqual(opened);
    expect(after.design).toEqual(savedDesign.design);
  });

  it("keeps the saved design when the save before it failed", () => {
    const savedDesign = edit(open(defaultDesign()), "sm");
    const failed = save(edit(save(savedDesign, true), "lg"), false);
    const after = leave(failed);

    expect(after.design).toEqual(savedDesign.design);
    expect(after.design.theme.radius).toBe("sm");
  });

  it("starts from the page's design when nothing was saved", () => {
    const opened = open(defaultDesign());
    const after = leave(edit(opened, "lg"));

    expect(after.design).toEqual(opened.design);
    expect(after.session.dirty).toBe(false);
  });

  it("bumps the token once per Leave and only for Leave", () => {
    const dirty = edit(open(defaultDesign()), "sm");
    const stayed = leaveSession(dirty.session, { type: "setDirty", dirty: true });

    expect(stayed.discardToken).toBe(dirty.session.discardToken);
    expect(leave(dirty).session.discardToken).toBe(dirty.session.discardToken + 1);
  });

  it("counts a second Leave, so a second visit is discarded too", () => {
    const first = leave(edit(open(defaultDesign()), "sm"));
    const second = leave(edit(first, "lg"));

    expect(second.session.discardToken).toBe(first.session.discardToken + 1);
    expect(second.design.theme.radius).toBe(first.design.theme.radius);
  });
});
