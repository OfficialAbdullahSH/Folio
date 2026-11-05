"use client";

import { cn } from "../lib/cn";
import { INPUT, LABEL } from "../lib/styles";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const YEAR_MIN = 1950;
const YEAR_MAX = 2100;

/**
 * Newest first, so a current job is near the top.
 *
 * A fixed range, not "this year": reading the clock during render is an unstable
 * value the prerenderer rejects, and the range costs nothing.
 */
const YEARS: number[] = Array.from(
  { length: YEAR_MAX - YEAR_MIN + 1 },
  (_, index) => YEAR_MAX - index,
);

/**
 * A month picker built from two selects.
 *
 * `input type="month"` is not supported everywhere, and the schema wants `YYYY-MM`,
 * so this writes that shape directly and never produces a half-filled value.
 */
export function MonthYearSelect({
  id,
  label,
  value,
  onChange,
  disabled,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}) {
  const [year = "", month = ""] = value.split("-");
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <span id={`${id}-label`} className={LABEL}>
        {label}
      </span>
      <div className="flex gap-2">
        <select
          aria-label={`${label} month`}
          aria-describedby={error !== undefined ? errorId : undefined}
          aria-invalid={error !== undefined || undefined}
          value={month}
          disabled={disabled}
          onChange={(event) => {
            const nextMonth = event.target.value;
            const nextYear = year === "" ? String(new Date().getFullYear()) : year;

            onChange(nextMonth === "" ? "" : `${nextYear}-${nextMonth}`);
          }}
          className={cn(INPUT, "w-full", error !== undefined && "border-danger")}
        >
          <option value="">Month</option>
          {MONTHS.map((name, index) => (
            <option key={name} value={String(index + 1).padStart(2, "0")}>
              {name}
            </option>
          ))}
        </select>
        <select
          aria-label={`${label} year`}
          aria-describedby={error !== undefined ? errorId : undefined}
          aria-invalid={error !== undefined || undefined}
          value={year}
          disabled={disabled}
          onChange={(event) => {
            const nextYear = event.target.value;
            const nextMonth = month === "" ? "01" : month;

            onChange(nextYear === "" ? "" : `${nextYear}-${nextMonth}`);
          }}
          className={cn(INPUT, "w-full", error !== undefined && "border-danger")}
        >
          <option value="">Year</option>
          {YEARS.map((year) => (
            <option key={year} value={String(year)}>
              {year}
            </option>
          ))}
        </select>
      </div>
      {error !== undefined ? (
        <p id={errorId} className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
