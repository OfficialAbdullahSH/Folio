import { z } from "zod";

import {
  FONT_KEYS,
  HEX_COLOR_PATTERN,
  RADIUS_VALUES,
  SCHEMA_VERSION,
  SECTION_DISPLAY_STYLES,
  SECTION_IDS,
  WORLDS,
} from "./constants";

const hexColor = z
  .string()
  .regex(HEX_COLOR_PATTERN, "Must be a #RRGGBB hex color")
  .transform((value) => value.toLowerCase());

export const themeSchema = z.strictObject({
  colors: z.strictObject({
    background: hexColor,
    surface: hexColor,
    text: hexColor,
    muted: hexColor,
    accent: hexColor,
    border: hexColor,
  }),
  headingFont: z.enum(FONT_KEYS),
  bodyFont: z.enum(FONT_KEYS),
  radius: z.enum(RADIUS_VALUES),
});

const heroSectionSchema = z.strictObject({
  id: z.literal("hero"),
  visible: z.boolean(),
  displayStyle: z.enum(SECTION_DISPLAY_STYLES.hero),
});

const aboutSectionSchema = z.strictObject({
  id: z.literal("about"),
  visible: z.boolean(),
});

const projectsSectionSchema = z.strictObject({
  id: z.literal("projects"),
  visible: z.boolean(),
  displayStyle: z.enum(SECTION_DISPLAY_STYLES.projects),
});

const skillsSectionSchema = z.strictObject({
  id: z.literal("skills"),
  visible: z.boolean(),
  displayStyle: z.enum(SECTION_DISPLAY_STYLES.skills),
});

const experienceSectionSchema = z.strictObject({
  id: z.literal("experience"),
  visible: z.boolean(),
  displayStyle: z.enum(SECTION_DISPLAY_STYLES.experience),
});

const contactSectionSchema = z.strictObject({
  id: z.literal("contact"),
  visible: z.boolean(),
});

export const sectionSchema = z.discriminatedUnion("id", [
  heroSectionSchema,
  aboutSectionSchema,
  projectsSectionSchema,
  skillsSectionSchema,
  experienceSectionSchema,
  contactSectionSchema,
]);

export const sectionsSchema = z.array(sectionSchema).superRefine((sections, ctx) => {
  const seen = new Set<string>();

  sections.forEach((section, index) => {
    if (seen.has(section.id)) {
      ctx.addIssue({
        code: "custom",
        message: `Duplicate section id "${section.id}"`,
        path: [index, "id"],
      });
    }
    seen.add(section.id);
  });

  for (const id of SECTION_IDS) {
    if (!seen.has(id)) {
      ctx.addIssue({
        code: "custom",
        message: `Missing section "${id}"`,
        path: [],
      });
    }
  }

  if (sections.length !== SECTION_IDS.length) {
    ctx.addIssue({
      code: "custom",
      message: `Expected exactly ${SECTION_IDS.length} sections, received ${sections.length}`,
      path: [],
    });
  }
});

export const designDocumentSchema = z.strictObject({
  version: z.literal(SCHEMA_VERSION),
  world: z.enum(WORLDS),
  theme: themeSchema,
  sections: sectionsSchema,
});

export type DesignDocument = z.infer<typeof designDocumentSchema>;
export type DesignTheme = z.infer<typeof themeSchema>;
export type DesignSection = z.infer<typeof sectionSchema>;
export type SectionId = DesignSection["id"];
