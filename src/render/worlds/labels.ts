import type { ContactItem, SectionId } from "@/schema";

export const SECTION_LABELS: Record<SectionId, string> = {
  hero: "Intro",
  about: "About",
  projects: "Projects",
  skills: "Skills",
  experience: "Experience",
  contact: "Contact",
};

export const CONTACT_KIND_LABELS: Record<ContactItem["kind"], string> = {
  email: "Email",
  github: "GitHub",
  linkedin: "LinkedIn",
  website: "Website",
  x: "X",
  other: "Link",
};
