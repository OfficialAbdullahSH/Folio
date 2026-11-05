"use client";

import { Plus } from "lucide-react";

import { LIMITS } from "@/schema";
import type { ProjectItem } from "@/schema";

import type { EditorAction } from "../reducer";
import { BUTTON_SECONDARY, ITEM_CARD } from "../lib/styles";
import { TextAreaField, TextField } from "./field";
import { ImageUpload } from "./image-upload";
import { ItemActions } from "./item-actions";
import { EditorSection, EmptyList } from "./section-card";

export type FieldErrors = Record<string, string>;

export function ProjectList({
  projects,
  errors,
  dispatch,
  userId,
  onAdd,
}: {
  projects: ProjectItem[];
  errors: FieldErrors;
  dispatch: (action: EditorAction) => void;
  userId: string;
  onAdd: () => void;
}) {
  const canAdd = projects.length < LIMITS.projects;

  return (
    <EditorSection
      id="projects"
      title="Projects"
      description="Up to 12. The first one is shown largest, so put your best work first."
      action={
        <button type="button" className={BUTTON_SECONDARY} onClick={onAdd} disabled={!canAdd}>
          <Plus aria-hidden="true" size={18} />
          Add project
        </button>
      }
    >
      {projects.length === 0 ? (
        <EmptyList>No projects yet. Add one to show what you have built.</EmptyList>
      ) : null}

      <ul className="flex flex-col gap-4">
        {projects.map((project, index) => {
          const base = `projects.items.${index}`;
          const title = project.title.trim().length > 0 ? project.title.trim() : `project ${index + 1}`;

          return (
            <li key={project.id} className={ITEM_CARD}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-ink">
                  {index + 1}. {title}
                </h3>
                <ItemActions
                  label={title}
                  index={index}
                  count={projects.length}
                  onMove={(direction) => dispatch({ type: "moveProject", id: project.id, direction })}
                  onRemove={() => dispatch({ type: "removeProject", id: project.id })}
                />
              </div>

              <div className="mt-4 flex flex-col gap-4">
                <TextField
                  id={`field-${base}.title`}
                  label="Title"
                  required
                  value={project.title}
                  maxLength={LIMITS.projectTitle}
                  error={errors[`${base}.title`]}
                  placeholder="What did you build?"
                  onChange={(value) =>
                    dispatch({ type: "setProjectField", id: project.id, field: "title", value })
                  }
                />

                <TextAreaField
                  id={`field-${base}.description`}
                  label="Description"
                  value={project.description}
                  maxLength={LIMITS.projectDescription}
                  error={errors[`${base}.description`]}
                  placeholder="What it does, what you built it with, and what changed."
                  onChange={(value) =>
                    dispatch({ type: "setProjectField", id: project.id, field: "description", value })
                  }
                />

                <TextField
                  id={`field-${base}.link`}
                  label="Link"
                  inputMode="url"
                  value={project.link ?? ""}
                  maxLength={LIMITS.url}
                  error={errors[`${base}.link`]}
                  hint="Optional. A full address starting with https://"
                  placeholder="https://github.com/you/project"
                  onChange={(value) =>
                    dispatch({ type: "setProjectField", id: project.id, field: "link", value })
                  }
                />

                <ImageUpload
                  id={`field-${base}.image`}
                  userId={userId}
                  projectLabel={title}
                  imageUrl={project.imageUrl}
                  error={errors[`${base}.imageUrl`]}
                  onUploaded={(url) =>
                    dispatch({ type: "setProjectImage", id: project.id, value: url })
                  }
                  onRemove={() =>
                    dispatch({ type: "setProjectImage", id: project.id, value: undefined })
                  }
                />
              </div>
            </li>
          );
        })}
      </ul>

      {!canAdd ? (
        <p className="text-sm text-ink-soft">
          That is the maximum of {LIMITS.projects} projects. Remove one to add another.
        </p>
      ) : null}
    </EditorSection>
  );
}
