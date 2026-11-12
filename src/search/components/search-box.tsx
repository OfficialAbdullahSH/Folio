"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { searchSkills, type Skill, type SkillAlias } from "@/editor/skills";
import { cn } from "@/editor/lib/cn";
import { BUTTON_PRIMARY, HINT, INPUT, LABEL } from "@/editor/lib/styles";

const MAX_SUGGESTIONS = 8;

/**
 * The one search control (AC-2, AC-6).
 *
 * It is a plain GET form first: with no JavaScript, typing a name and pressing Enter
 * still searches. The list of skills is the accessible combobox pattern layered on top
 * (WAI-ARIA APG): the input keeps focus, the highlighted option is announced with
 * `aria-activedescendant`, and choosing a suggestion opens that skill's search. Free
 * text is left to the form, which searches names and skills together.
 */
export function SearchBox({
  skills,
  aliases,
  initialQuery,
}: {
  skills: Skill[];
  aliases: SkillAlias[];
  initialQuery: string;
}) {
  const router = useRouter();
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const listId = `${baseId}-list`;
  const hintId = `${baseId}-hint`;
  const options = useRef<(HTMLLIElement | null)[]>([]);

  const [value, setValue] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const suggestions = useMemo(() => {
    if (value.trim().length === 0) {
      return [];
    }

    return searchSkills(skills, aliases, value).slice(0, MAX_SUGGESTIONS);
  }, [skills, aliases, value]);

  const expanded = open && suggestions.length > 0;

  useEffect(() => {
    if (active >= 0) {
      options.current[active]?.scrollIntoView({ block: "nearest" });
    }
  }, [active]);

  const optionId = (index: number) => `${baseId}-option-${index}`;

  function choose(skill: Skill) {
    setOpen(false);
    setActive(-1);
    router.push(`/search?skill=${encodeURIComponent(skill.slug)}`);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (suggestions.length === 0) {
        return;
      }

      event.preventDefault();

      if (!expanded) {
        setOpen(true);
        setActive(event.key === "ArrowDown" ? 0 : suggestions.length - 1);

        return;
      }

      setActive((index) => {
        if (event.key === "ArrowDown") {
          return (index + 1) % suggestions.length;
        }

        return index <= 0 ? suggestions.length - 1 : index - 1;
      });

      return;
    }

    if (event.key === "Home" && expanded) {
      event.preventDefault();
      setActive(0);

      return;
    }

    if (event.key === "End" && expanded) {
      event.preventDefault();
      setActive(suggestions.length - 1);

      return;
    }

    if (event.key === "Escape" && expanded) {
      event.preventDefault();
      setOpen(false);
      setActive(-1);

      return;
    }

    if (event.key === "Enter" && expanded && active >= 0) {
      const skill = suggestions[active];

      if (skill !== undefined) {
        event.preventDefault();
        choose(skill);
      }
    }
  }

  return (
    <form action="/search" method="get" role="search" className="flex flex-col gap-2">
      <label htmlFor={inputId} className={LABEL}>
        Search portfolios
      </label>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            size={16}
            className="pointer-events-none absolute inset-y-0 start-3 my-auto text-ink-soft"
          />
          <input
            id={inputId}
            name="q"
            type="text"
            role="combobox"
            dir="auto"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            value={value}
            aria-expanded={expanded}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={expanded && active >= 0 ? optionId(active) : undefined}
            aria-describedby={hintId}
            placeholder="A name, or a skill like react"
            className={cn(INPUT, "ps-9")}
            onChange={(event) => {
              setValue(event.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onKeyDown={onKeyDown}
            onBlur={() => setOpen(false)}
          />

          <ul
            id={listId}
            role="listbox"
            aria-label="Skills"
            hidden={!expanded}
            className="absolute inset-x-0 top-full z-10 mt-1 max-h-64 overflow-y-auto rounded-md border border-rule bg-panel py-1 shadow-lg"
          >
            {expanded
              ? suggestions.map((skill, index) => (
                  <li
                    key={skill.slug}
                    id={optionId(index)}
                    role="option"
                    aria-selected={index === active}
                    ref={(element) => {
                      options.current[index] = element;
                    }}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => choose(skill)}
                    className={cn(
                      "flex min-h-11 cursor-pointer items-center justify-between gap-3 px-3 text-sm text-ink",
                      index === active && "bg-canvas",
                    )}
                  >
                    <span dir="auto">{skill.name}</span>
                    <span className="text-xs text-ink-soft">{skill.slug}</span>
                  </li>
                ))
              : null}
          </ul>
        </div>

        <button type="submit" className={BUTTON_PRIMARY}>
          Search
        </button>
      </div>

      <p id={hintId} className={HINT}>
        Press Enter to search names and skills together, or pick a skill to see who lists it.
      </p>

      <p role="status" className="sr-only">
        {expanded
          ? `${suggestions.length} ${suggestions.length === 1 ? "skill" : "skills"} suggested`
          : ""}
      </p>
    </form>
  );
}
