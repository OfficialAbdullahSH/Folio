"use client";

import type { ReactNode } from "react";

import { cn } from "../lib/cn";
import { COUNTER, ERROR, HINT, INPUT, INPUT_INVALID, LABEL } from "../lib/styles";

export type FieldProps = {
  /** The element id. The save error for this field is `<id>-error`. */
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  hint?: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  inputMode?: "text" | "url" | "email";
};

type FrameProps = Pick<FieldProps, "id" | "label" | "value" | "maxLength" | "hint" | "error" | "required">;

type Control = {
  describedBy: string | undefined;
  invalid: boolean;
};

function FieldFrame({ id, label, value, maxLength, hint, error, required, children }: FrameProps & { children: (control: Control) => ReactNode }) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const showHint = hint !== undefined && error === undefined;
  const describedBy = [showHint ? hintId : null, error !== undefined ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={LABEL}>
          {label}
          {required === true ? (
            <span className="ml-1 text-ink-soft" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
        {maxLength !== undefined ? (
          <span className={COUNTER} aria-hidden="true">
            {value.length}/{maxLength}
          </span>
        ) : null}
      </div>

      {children({
        describedBy: describedBy.length > 0 ? describedBy : undefined,
        invalid: error !== undefined,
      })}

      {showHint ? (
        <p id={hintId} className={HINT}>
          {hint}
        </p>
      ) : null}

      {error !== undefined ? (
        <p id={errorId} className={ERROR}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  id,
  label,
  value,
  onChange,
  maxLength,
  hint,
  error,
  placeholder,
  required,
  disabled,
  inputMode = "text",
}: FieldProps) {
  return (
    <FieldFrame
      id={id}
      label={label}
      value={value}
      maxLength={maxLength}
      hint={hint}
      error={error}
      required={required}
    >
      {({ describedBy, invalid }) => (
        <input
          id={id}
          type="text"
          dir="auto"
          inputMode={inputMode}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={maxLength}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(INPUT, invalid && INPUT_INVALID)}
        />
      )}
    </FieldFrame>
  );
}

export function TextAreaField({
  id,
  label,
  value,
  onChange,
  maxLength,
  hint,
  error,
  placeholder,
  required,
  disabled,
  rows = 4,
}: FieldProps & { rows?: number }) {
  return (
    <FieldFrame
      id={id}
      label={label}
      value={value}
      maxLength={maxLength}
      hint={hint}
      error={error}
      required={required}
    >
      {({ describedBy, invalid }) => (
        <textarea
          id={id}
          dir="auto"
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={maxLength}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(INPUT, "min-h-24 resize-y leading-relaxed", invalid && INPUT_INVALID)}
        />
      )}
    </FieldFrame>
  );
}
