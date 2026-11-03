import { z } from "zod";

import {
  CONTACT_KINDS,
  EXPERIENCE_KINDS,
  LIMITS,
  SCHEMA_VERSION,
  SKILL_SLUG_PATTERN,
  YEAR_MONTH_PATTERN,
} from "./constants";

type IssueSink = {
  addIssue: (issue: {
    code: "custom";
    message: string;
    path: (string | number)[];
  }) => void;
};

const trimmed = (value: string) => value.trim();

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const requiredText = (max: number) =>
  z
    .string()
    .max(max, `Must be at most ${max} characters`)
    .refine((value) => value.trim().length > 0, "Required");

const httpUrl = z
  .string()
  .transform(trimmed)
  .pipe(z.string().max(LIMITS.url, `Must be at most ${LIMITS.url} characters`))
  .refine(isHttpUrl, "Must be an http or https URL");

const yearMonth = z
  .string()
  .regex(YEAR_MONTH_PATTERN, "Must be YYYY-MM with month 01-12");

const skillSlugSchema = z
  .string()
  .max(LIMITS.skillSlug, `Must be at most ${LIMITS.skillSlug} characters`)
  .regex(SKILL_SLUG_PATTERN, "Must contain only lowercase letters, digits and hyphens");

function checkUniqueIds(items: readonly { id: string }[], ctx: IssueSink) {
  const seen = new Set<string>();

  items.forEach((item, index) => {
    if (seen.has(item.id)) {
      ctx.addIssue({
        code: "custom",
        message: `Duplicate item id "${item.id}"`,
        path: ["items", index, "id"],
      });
    }
    seen.add(item.id);
  });
}

export const projectItemSchema = z.strictObject({
  id: z.uuid(),
  title: requiredText(LIMITS.projectTitle),
  description: z
    .string()
    .max(LIMITS.projectDescription, `Must be at most ${LIMITS.projectDescription} characters`),
  imageUrl: httpUrl.optional(),
  link: httpUrl.optional(),
});

export const experienceItemSchema = z
  .strictObject({
    id: z.uuid(),
    kind: z.enum(EXPERIENCE_KINDS),
    title: requiredText(LIMITS.experienceTitle),
    organization: requiredText(LIMITS.experienceOrganization),
    startDate: yearMonth,
    endDate: yearMonth.optional(),
    current: z.boolean().optional(),
    description: z
      .string()
      .max(
        LIMITS.experienceDescription,
        `Must be at most ${LIMITS.experienceDescription} characters`,
      )
      .optional(),
  })
  .superRefine((item, ctx) => {
    if (item.endDate !== undefined && item.endDate < item.startDate) {
      ctx.addIssue({
        code: "custom",
        message: "endDate cannot be before startDate",
        path: ["endDate"],
      });
    }

    if (item.current === true && item.endDate !== undefined) {
      ctx.addIssue({
        code: "custom",
        message: "current cannot be true when endDate is set",
        path: ["current"],
      });
    }
  });

export const contactItemSchema = z
  .strictObject({
    id: z.uuid(),
    kind: z.enum(CONTACT_KINDS),
    label: requiredText(LIMITS.contactLabel),
    value: z
      .string()
      .transform(trimmed)
      .pipe(z.string().max(LIMITS.url, `Must be at most ${LIMITS.url} characters`)),
  })
  .superRefine((item, ctx) => {
    if (item.kind === "email") {
      if (!z.email().safeParse(item.value).success) {
        ctx.addIssue({
          code: "custom",
          message: "Must be a valid email address",
          path: ["value"],
        });
      }
      return;
    }

    if (!isHttpUrl(item.value)) {
      ctx.addIssue({
        code: "custom",
        message: "Must be an http or https URL",
        path: ["value"],
      });
    }
  });

export const contentDocumentSchema = z.strictObject({
  version: z.literal(SCHEMA_VERSION),
  about: z.strictObject({
    text: z
      .string()
      .max(LIMITS.aboutText, `Must be at most ${LIMITS.aboutText} characters`),
  }),
  projects: z
    .strictObject({
      items: z
        .array(projectItemSchema)
        .max(LIMITS.projects, `At most ${LIMITS.projects} projects`),
    })
    .superRefine((value, ctx) => checkUniqueIds(value.items, ctx)),
  skills: z
    .strictObject({
      skillIds: z
        .array(skillSlugSchema)
        .max(LIMITS.skillIds, `At most ${LIMITS.skillIds} skills`),
    })
    .superRefine((value, ctx) => {
      const seen = new Set<string>();

      value.skillIds.forEach((slug, index) => {
        if (seen.has(slug)) {
          ctx.addIssue({
            code: "custom",
            message: `Duplicate skill "${slug}"`,
            path: ["skillIds", index],
          });
        }
        seen.add(slug);
      });
    }),
  experience: z
    .strictObject({
      items: z
        .array(experienceItemSchema)
        .max(LIMITS.experience, `At most ${LIMITS.experience} entries`),
    })
    .superRefine((value, ctx) => checkUniqueIds(value.items, ctx)),
  contact: z
    .strictObject({
      items: z
        .array(contactItemSchema)
        .max(LIMITS.contact, `At most ${LIMITS.contact} links`),
    })
    .superRefine((value, ctx) => checkUniqueIds(value.items, ctx)),
});

export type ContentDocument = z.infer<typeof contentDocumentSchema>;
export type ProjectItem = z.infer<typeof projectItemSchema>;
export type ExperienceItem = z.infer<typeof experienceItemSchema>;
export type ContactItem = z.infer<typeof contactItemSchema>;
