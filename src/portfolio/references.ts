import { isProjectImageUrl } from "@/editor/image-url";
import type { ContentDocument } from "@/schema";

/**
 * The references a content document makes that the schema cannot check on its own
 * (D-033, D-066): every skill slug must exist in the seeded list, and every project
 * image must live in this project's bucket.
 *
 * Both the editor's save and publishing run this, so a portfolio cannot reach the
 * public page with a skill the search cannot resolve or an image hosted elsewhere.
 */

export type ReferenceError = {
  /** The content-relative schema path, e.g. `projects.items.0.imageUrl`. */
  path: string;
  message: string;
};

export type ReferenceDeps = {
  /** Every slug in `public.skills`, so an unknown skill cannot be stored (D-033). */
  knownSkillSlugs: ReadonlySet<string>;
  /** The public URL prefix of this project's `project-images` bucket (D-066). */
  imagePrefix: string;
};

export function checkContentReferences(
  content: ContentDocument,
  deps: ReferenceDeps,
): ReferenceError[] {
  const errors: ReferenceError[] = [];

  content.skills.skillIds.forEach((slug, index) => {
    if (!deps.knownSkillSlugs.has(slug)) {
      errors.push({
        path: `skills.skillIds.${index}`,
        message: `"${slug}" is not in the skill list. Please pick it again.`,
      });
    }
  });

  content.projects.items.forEach((project, index) => {
    if (project.imageUrl !== undefined && !isProjectImageUrl(project.imageUrl, deps.imagePrefix)) {
      errors.push({
        path: `projects.items.${index}.imageUrl`,
        message: "That image was not uploaded here. Please upload it again.",
      });
    }
  });

  return errors;
}
