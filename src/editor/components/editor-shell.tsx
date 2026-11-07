"use client";

import { useActionState, useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";

import { LIMITS } from "@/schema";
import type { ContentDocument } from "@/schema";

import { saveContentAction, type SaveFormState } from "../actions";
import { editorReducer, type EditorAction, type EditorProfile, type EditorState } from "../reducer";
import type { Skill, SkillAlias } from "../skills";
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from "../lib/styles";
import { ContactList } from "./contact-list";
import { ExperienceList } from "./experience-list";
import { TextAreaField, TextField } from "./field";
import { ProjectList } from "./project-list";
import { EditorSection } from "./section-card";
import { SkillPicker } from "./skill-picker";

const IDLE: SaveFormState = { status: "idle" };

export type EditorShellProps = {
  userId: string;
  username: string;
  profile: EditorProfile;
  content: ContentDocument;
  skills: Skill[];
  aliases: SkillAlias[];
};

export function EditorShell({
  userId,
  username,
  profile,
  content,
  skills,
  aliases,
}: EditorShellProps) {
  const [state, dispatch] = useReducer(editorReducer, { content, profile } as EditorState);
  const [saveState, formAction, isPending] = useActionState(saveContentAction, IDLE);
  const [revision, setRevision] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Derived, not stored: the action echoes back the revision it was given, so a save
  // clears the warning without an effect and a later edit raises it again.
  const savedRevision = saveState.status === "saved" ? saveState.revision : 0;
  const dirty = revision > savedRevision;

  useEffect(() => {
    if (saveState.status === "error") {
      summaryRef.current?.focus();
    }
  }, [saveState]);

  useEffect(() => {
    if (!dirty) {
      return;
    }

    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", warn);

    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function change(action: EditorAction) {
    dispatch(action);
    setRevision((count) => count + 1);
  }

  const errors: Record<string, string> =
    saveState.status === "error"
      ? Object.fromEntries(saveState.errors.map((error) => [error.path, error.message]))
      : {};

  return (
    <div className="flex min-h-full flex-col bg-canvas">
      <header className="sticky top-0 z-10 border-b border-rule bg-panel">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-0.5">
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center text-sm text-ink-soft underline-offset-2 hover:text-ink hover:underline"
            >
              Dashboard
            </Link>
            <h1 className="text-xl font-semibold text-ink">Edit your portfolio</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/dashboard/design" className={BUTTON_SECONDARY}>
              Design
            </Link>
            <Link href="/dashboard/preview" className={BUTTON_SECONDARY}>
              Preview
            </Link>
            <button type="submit" form="editor-form" className={BUTTON_PRIMARY} disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6">
        <form id="editor-form" action={formAction} className="flex flex-col gap-5" noValidate>
          <input
            type="hidden"
            name="payload"
            value={JSON.stringify({ ...state, revision })}
          />

          <p role="status" aria-live="polite" className="text-sm text-ink-soft">
            {isPending
              ? "Saving your changes…"
              : saveState.status === "saved" ? (
                  <>
                    Saved{" "}
                    <time dateTime={saveState.savedAt} suppressHydrationWarning>
                      {new Date(saveState.savedAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </>
                ) : dirty ? (
                  "You have unsaved changes."
                ) : (
                  "All changes saved."
                )}
          </p>

          {saveState.status === "error" ? (
            <div
              ref={summaryRef}
              tabIndex={-1}
              role="alert"
              className="rounded-lg border border-danger/40 bg-danger-surface p-4 text-sm text-danger focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <p className="font-semibold">Your changes were not saved.</p>
              <p className="mt-1">{saveState.message}</p>
              {saveState.errors.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {saveState.errors.map((error) => (
                    <li key={`${error.path}-${error.message}`}>{error.message}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <EditorSection
            id="profile"
            title="Name and headline"
            description="Shown at the top of your page and wherever your link is shared."
          >
            <TextField
              id="field-profile.displayName"
              label="Display name"
              required
              value={state.profile.displayName}
              maxLength={LIMITS.displayName}
              error={errors["profile.displayName"]}
              onChange={(value) => change({ type: "setProfileField", field: "displayName", value })}
            />
            <TextField
              id="field-profile.headline"
              label="Headline"
              value={state.profile.headline}
              maxLength={LIMITS.headline}
              hint="One line about what you do. Optional."
              placeholder="Computer science student building web apps"
              error={errors["profile.headline"]}
              onChange={(value) => change({ type: "setProfileField", field: "headline", value })}
            />
            <p className="text-sm text-ink-soft">
              Your page address is{" "}
              <span className="font-medium text-ink">/u/{username}</span>.
            </p>
          </EditorSection>

          <EditorSection
            id="about"
            title="About"
            description="A short introduction. Two or three sentences is plenty."
          >
            <TextAreaField
              id="field-about.text"
              label="About you"
              value={state.content.about.text}
              maxLength={LIMITS.aboutText}
              rows={6}
              error={errors["about.text"]}
              placeholder="Who you are, what you are studying or working on, and what you are looking for."
              onChange={(value) => change({ type: "setAbout", value })}
            />
          </EditorSection>

          <ProjectList
            projects={state.content.projects.items}
            errors={errors}
            dispatch={change}
            userId={userId}
            onAdd={() => change({ type: "addProject", id: crypto.randomUUID() })}
          />

          <SkillPicker
            skills={skills}
            aliases={aliases}
            selected={state.content.skills.skillIds}
            error={errors["skills.skillIds"]}
            onAdd={(slug) => change({ type: "addSkill", slug })}
            onRemove={(slug) => change({ type: "removeSkill", slug })}
          />

          <ExperienceList
            experience={state.content.experience.items}
            errors={errors}
            dispatch={change}
            onAdd={() =>
              change({
                type: "addExperience",
                id: crypto.randomUUID(),
                startDate: new Date().toISOString().slice(0, 7),
              })
            }
          />

          <ContactList
            contact={state.content.contact.items}
            errors={errors}
            dispatch={change}
            onAdd={() => change({ type: "addContact", id: crypto.randomUUID() })}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-5">
            <p className="text-sm text-ink-soft">Save before you leave, or your edits are lost.</p>
            <button type="submit" className={BUTTON_PRIMARY} disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
