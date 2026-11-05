"use client";

import { useMemo, useState } from "react";
import { Check, Plus, X } from "lucide-react";

import { LIMITS } from "@/schema";

import { cn } from "../lib/cn";
import { BUTTON_SECONDARY, CHIP, HINT, INPUT, LABEL } from "../lib/styles";
import { resolveSkill, searchSkills, type Skill, type SkillAlias } from "../skills";
import { EditorSection } from "./section-card";

const MAX_RESULTS = 8;

/**
 * Search the whole list in the browser and add the canonical skill (D-064).
 *
 * An alias resolves to the skill it points at, so "ReactJS" adds `react` and the
 * saved value stays canonical (D-033).
 */
export function SkillPicker({
  skills,
  aliases,
  selected,
  error,
  onAdd,
  onRemove,
}: {
  skills: Skill[];
  aliases: SkillAlias[];
  selected: string[];
  error?: string;
  onAdd: (slug: string) => void;
  onRemove: (slug: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [announcement, setAnnouncement] = useState("");

  const names = useMemo(
    () => new Map(skills.map((skill) => [skill.slug, skill.name])),
    [skills],
  );
  const results = useMemo(
    () => searchSkills(skills, aliases, query).slice(0, MAX_RESULTS),
    [skills, aliases, query],
  );

  const atLimit = selected.length >= LIMITS.skillIds;

  function add(candidate: string) {
    const skill = resolveSkill(skills, aliases, candidate);

    if (skill === null) {
      setAnnouncement(`No skill matches “${candidate}”.`);
      return;
    }

    if (selected.includes(skill.slug)) {
      setAnnouncement(`${skill.name} is already added.`);
      return;
    }

    if (atLimit) {
      setAnnouncement(`You can add up to ${LIMITS.skillIds} skills.`);
      return;
    }

    onAdd(skill.slug);
    setAnnouncement(`${skill.name} added.`);
    setQuery("");
  }

  const chosen = selected.map((slug) => ({ slug, name: names.get(slug) ?? slug }));

  return (
    <EditorSection
      id="skills"
      title="Skills"
      description={`Up to ${LIMITS.skillIds}. Search by the name you know it by — “ReactJS” finds React.`}
    >
      {skills.length === 0 ? (
        <p className="rounded-md border border-warn/40 bg-warn-surface px-4 py-3 text-sm text-warn">
          The skill list is not loaded yet. Run{" "}
          <code className="font-mono text-xs">supabase/migrations/0002_skills_and_storage.sql</code>{" "}
          and <code className="font-mono text-xs">supabase/seed/skills.sql</code>, then reload this
          page.
        </p>
      ) : null}

      {chosen.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Skills you have added">
          {chosen.map(({ slug, name }) => (
            <li key={slug} className={CHIP}>
              <span dir="auto">{name}</span>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:bg-rule focus-visible:ring-2 focus-visible:ring-cta focus-visible:outline-none"
                onClick={() => onRemove(slug)}
                aria-label={`Remove ${name}`}
              >
                <X aria-hidden="true" size={16} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={HINT}>Nothing added yet.</p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="field-skills-search" className={LABEL}>
          Find a skill
        </label>
        <input
          id="field-skills-search"
          type="search"
          dir="auto"
          autoComplete="off"
          value={query}
          disabled={skills.length === 0 || atLimit}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();

              const first = results[0];

              if (first !== undefined) {
                add(first.slug);
              }
            }
          }}
          placeholder="Start typing, for example “react”"
          className={cn(INPUT, error !== undefined && "border-danger")}
          aria-describedby="field-skills-hint"
          aria-invalid={error !== undefined || undefined}
        />
        <p id="field-skills-hint" className={HINT}>
          {atLimit
            ? `You have the maximum of ${LIMITS.skillIds} skills.`
            : `${selected.length} of ${LIMITS.skillIds} added.`}
        </p>
        {error !== undefined ? (
          <p className="text-sm font-medium text-danger">{error}</p>
        ) : null}
      </div>

      {skills.length > 0 && query.trim().length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-ink-soft" aria-live="polite">
            {results.length === 0
              ? "No skill matches that."
              : `${results.length} ${results.length === 1 ? "match" : "matches"}`}
          </p>
          {results.length > 0 ? (
            <ul className="flex max-h-64 flex-wrap gap-2 overflow-y-auto">
              {results.map((skill) => {
                const added = selected.includes(skill.slug);

                return (
                  <li key={skill.slug}>
                    <button
                      type="button"
                      disabled={added || atLimit}
                      onClick={() => add(skill.slug)}
                      className={cn(
                        BUTTON_SECONDARY,
                        "justify-start px-3",
                        added && "text-ink-soft",
                      )}
                    >
                      {added ? (
                        <Check aria-hidden="true" size={16} />
                      ) : (
                        <Plus aria-hidden="true" size={16} />
                      )}
                      <span dir="auto">{skill.name}</span>
                      {added ? <span className="sr-only">(added)</span> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : null}

      <p role="status" className="sr-only">
        {announcement}
      </p>
    </EditorSection>
  );
}
