"use client";

import { Plus } from "lucide-react";

import { EXPERIENCE_KINDS, LIMITS } from "@/schema";
import type { ExperienceItem } from "@/schema";

import type { EditorAction } from "../reducer";
import { BUTTON_SECONDARY, HINT, INPUT, ITEM_CARD, LABEL } from "../lib/styles";
import { TextAreaField, TextField } from "./field";
import { ItemActions } from "./item-actions";
import { MonthYearSelect } from "./month-year-select";
import { EditorSection, EmptyList } from "./section-card";

const KIND_LABELS: Record<ExperienceItem["kind"], string> = {
  experience: "Work",
  education: "Education",
};

export function ExperienceList({
  experience,
  errors,
  dispatch,
  onAdd,
}: {
  experience: ExperienceItem[];
  errors: Record<string, string>;
  dispatch: (action: EditorAction) => void;
  onAdd: () => void;
}) {
  const canAdd = experience.length < LIMITS.experience;

  return (
    <EditorSection
      id="experience"
      title="Experience"
      description={`Work and education, up to ${LIMITS.experience}. Most recent first.`}
      action={
        <button type="button" className={BUTTON_SECONDARY} onClick={onAdd} disabled={!canAdd}>
          <Plus aria-hidden="true" size={18} />
          Add entry
        </button>
      }
    >
      {experience.length === 0 ? (
        <EmptyList>Nothing here yet. Add a job, an internship or a degree.</EmptyList>
      ) : null}

      <ul className="flex flex-col gap-4">
        {experience.map((item, index) => {
          const base = `experience.items.${index}`;
          const heading =
            item.title.trim().length > 0 ? item.title.trim() : `entry ${index + 1}`;

          return (
            <li key={item.id} className={ITEM_CARD}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-ink">
                  {index + 1}. {heading}
                </h3>
                <ItemActions
                  label={heading}
                  index={index}
                  count={experience.length}
                  onMove={(direction) =>
                    dispatch({ type: "moveExperience", id: item.id, direction })
                  }
                  onRemove={() => dispatch({ type: "removeExperience", id: item.id })}
                />
              </div>

              <div className="mt-4 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`field-${base}.kind`} className={LABEL}>
                    Kind
                  </label>
                  <select
                    id={`field-${base}.kind`}
                    value={item.kind}
                    onChange={(event) =>
                      dispatch({
                        type: "setExperienceKind",
                        id: item.id,
                        kind: event.target.value as ExperienceItem["kind"],
                      })
                    }
                    className={INPUT}
                  >
                    {EXPERIENCE_KINDS.map((kind) => (
                      <option key={kind} value={kind}>
                        {KIND_LABELS[kind]}
                      </option>
                    ))}
                  </select>
                </div>

                <TextField
                  id={`field-${base}.title`}
                  label="Role or qualification"
                  required
                  value={item.title}
                  maxLength={LIMITS.experienceTitle}
                  error={errors[`${base}.title`]}
                  placeholder="Frontend intern"
                  onChange={(value) =>
                    dispatch({ type: "setExperienceField", id: item.id, field: "title", value })
                  }
                />

                <TextField
                  id={`field-${base}.organization`}
                  label="Organisation"
                  required
                  value={item.organization}
                  maxLength={LIMITS.experienceOrganization}
                  error={errors[`${base}.organization`]}
                  placeholder="Company or university"
                  onChange={(value) =>
                    dispatch({
                      type: "setExperienceField",
                      id: item.id,
                      field: "organization",
                      value,
                    })
                  }
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="flex-1">
                    <MonthYearSelect
                      id={`field-${base}.startDate`}
                      label="Started"
                      value={item.startDate}
                      error={errors[`${base}.startDate`]}
                      onChange={(value) =>
                        dispatch({ type: "setExperienceStart", id: item.id, value })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <MonthYearSelect
                      id={`field-${base}.endDate`}
                      label="Ended"
                      value={item.endDate ?? ""}
                      disabled={item.current === true}
                      error={errors[`${base}.endDate`]}
                      onChange={(value) =>
                        dispatch({ type: "setExperienceEnd", id: item.id, value })
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="inline-flex min-h-11 items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={item.current === true}
                      onChange={() => dispatch({ type: "toggleExperienceCurrent", id: item.id })}
                      className="h-5 w-5 rounded border-rule-strong text-ink focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2"
                    />
                    Still ongoing
                  </label>
                  {errors[`${base}.current`] !== undefined ? (
                    <p className="text-sm font-medium text-danger">{errors[`${base}.current`]}</p>
                  ) : null}
                  <p className={HINT}>Ticking this clears the end date.</p>
                </div>

                <TextAreaField
                  id={`field-${base}.description`}
                  label="Description"
                  value={item.description ?? ""}
                  maxLength={LIMITS.experienceDescription}
                  error={errors[`${base}.description`]}
                  placeholder="One or two lines about what you did."
                  onChange={(value) =>
                    dispatch({
                      type: "setExperienceField",
                      id: item.id,
                      field: "description",
                      value,
                    })
                  }
                />
              </div>
            </li>
          );
        })}
      </ul>

      {!canAdd ? (
        <p className="text-sm text-ink-soft">
          That is the maximum of {LIMITS.experience} entries. Remove one to add another.
        </p>
      ) : null}
    </EditorSection>
  );
}
