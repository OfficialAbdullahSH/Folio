import type { z } from "zod";

import { contentDocumentSchema } from "./content.schema";
import { designDocumentSchema } from "./design.schema";
import { profileSchema } from "./profile.schema";

export * from "./constants";
export {
  designDocumentSchema,
  sectionSchema,
  sectionsSchema,
  themeSchema,
} from "./design.schema";
export type {
  DesignDocument,
  DesignSection,
  DesignTheme,
  SectionId,
} from "./design.schema";
export {
  contactItemSchema,
  contentDocumentSchema,
  experienceItemSchema,
  projectItemSchema,
} from "./content.schema";
export type {
  ContactItem,
  ContentDocument,
  ExperienceItem,
  ProjectItem,
} from "./content.schema";
export { displayNameSchema, headlineSchema, profileSchema, usernameSchema } from "./profile.schema";
export type { Profile } from "./profile.schema";

export type ValidationIssue = {
  path: string;
  message: string;
};

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ValidationIssue[] };

function toResult<TSchema extends z.ZodType>(
  schema: TSchema,
  input: unknown,
): ValidationResult<z.infer<TSchema>> {
  const parsed = schema.safeParse(input);

  if (parsed.success) {
    return { success: true, data: parsed.data };
  }

  return {
    success: false,
    errors: parsed.error.issues.map((issue) => ({
      path: issue.path.length > 0 ? issue.path.map(String).join(".") : "(root)",
      message: issue.message,
    })),
  };
}

export const validateDesign = (input: unknown) =>
  toResult(designDocumentSchema, input);

export const validateContent = (input: unknown) =>
  toResult(contentDocumentSchema, input);

export const validateProfile = (input: unknown) => toResult(profileSchema, input);
