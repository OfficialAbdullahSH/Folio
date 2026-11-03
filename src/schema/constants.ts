export const SCHEMA_VERSION = 1;

export const WORLDS = ["editorial", "terminal"] as const;

export const FONT_KEYS = [
  "inter",
  "space-grotesk",
  "playfair-display",
  "lora",
  "jetbrains-mono",
  "cairo",
] as const;

export const RADIUS_VALUES = ["none", "sm", "md", "lg"] as const;

export const SECTION_IDS = [
  "hero",
  "about",
  "projects",
  "skills",
  "experience",
  "contact",
] as const;

export const SECTION_DISPLAY_STYLES = {
  hero: ["large", "compact"],
  projects: ["grid", "cards", "timeline"],
  skills: ["tags", "list"],
  experience: ["timeline", "list"],
} as const;

export const CONTACT_KINDS = [
  "email",
  "github",
  "linkedin",
  "website",
  "x",
  "other",
] as const;

export const EXPERIENCE_KINDS = ["experience", "education"] as const;

export const LIMITS = {
  aboutText: 1500,
  projects: 12,
  projectTitle: 80,
  projectDescription: 400,
  skillIds: 30,
  skillSlug: 40,
  experience: 10,
  experienceTitle: 80,
  experienceOrganization: 80,
  experienceDescription: 300,
  contact: 8,
  contactLabel: 40,
  url: 2048,
  usernameMin: 3,
  usernameMax: 30,
  displayName: 60,
  headline: 120,
} as const;

export const RESERVED_USERNAMES = [
  "admin",
  "administrator",
  "api",
  "app",
  "assets",
  "auth",
  "builder",
  "dashboard",
  "editor",
  "folio",
  "help",
  "login",
  "logout",
  "me",
  "public",
  "register",
  "root",
  "search",
  "settings",
  "signup",
  "static",
  "support",
  "terms",
  "privacy",
  "u",
  "www",
  "about",
  "_next",
] as const;

export const SKILL_SLUG_PATTERN = /^[a-z0-9-]+$/;

export const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export const YEAR_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
