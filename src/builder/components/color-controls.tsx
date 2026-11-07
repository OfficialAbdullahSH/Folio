"use client";

import { useState } from "react";

import { cn } from "@/editor/lib/cn";
import { ERROR, HINT, INPUT, INPUT_INVALID, LABEL } from "@/editor/lib/styles";
import type { DesignTheme } from "@/schema";

import { COLOR_ROLES, type ColorRole } from "../contrast";
import { normalizeHexInput } from "../hex";
import { COLOR_ROLE_HINTS, COLOR_ROLE_LABELS } from "../labels";

const HEX_HINT = "Use six hex digits, for example #1c1917.";

export type ColorControlsProps = {
  colors: DesignTheme["colors"];
  onChange: (role: ColorRole, value: string) => void;
};

function HexField({
  id,
  value,
  onCommit,
}: {
  id: string;
  value: string;
  onCommit: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [lastValue, setLastValue] = useState(value);

  if (value !== lastValue) {
    setLastValue(value);
    setDraft(value);
  }

  const invalid = normalizeHexInput(draft) === null;
  const errorId = `${id}-error`;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <input
        id={id}
        type="text"
        dir="auto"
        spellCheck={false}
        autoComplete="off"
        value={draft}
        aria-invalid={invalid}
        aria-describedby={invalid ? errorId : undefined}
        onChange={(event) => {
          const next = event.target.value;
          const parsedNext = normalizeHexInput(next);

          setDraft(next);

          if (parsedNext !== null) {
            onCommit(parsedNext);
          }
        }}
        onBlur={() => {
          setDraft(normalizeHexInput(draft) ?? value);
        }}
        className={cn(INPUT, "font-mono text-sm", invalid && INPUT_INVALID)}
      />
      {invalid ? (
        <p id={errorId} className={ERROR}>
          {HEX_HINT}
        </p>
      ) : null}
    </div>
  );
}

export function ColorControls({ colors, onChange }: ColorControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      {COLOR_ROLES.map((role) => {
        const label = COLOR_ROLE_LABELS[role];
        const id = `color-${role}`;

        return (
          <div key={role} className="flex flex-col gap-2">
            <div className="flex flex-col gap-0.5">
              <label htmlFor={id} className={LABEL}>
                {label}
              </label>
              <p className={HINT}>{COLOR_ROLE_HINTS[role]}</p>
            </div>
            <div className="flex items-start gap-2">
              <input
                type="color"
                aria-label={`Pick a color for ${label.toLowerCase()}`}
                value={colors[role]}
                onChange={(event) => onChange(role, event.target.value)}
                className="h-11 w-11 shrink-0 cursor-pointer rounded-md border border-rule-strong bg-panel p-1"
              />
              <HexField
                id={id}
                value={colors[role]}
                onCommit={(value) => onChange(role, value)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
