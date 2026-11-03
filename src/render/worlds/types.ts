import type { ReactNode } from "react";

import type { ContentDocument, DesignSection, Profile, SectionId } from "@/schema";

import type { SkillNames } from "../types";

export type SectionProps = {
  section: DesignSection;
  profile: Profile;
  content: ContentDocument;
  skills: SkillNames;
};

export type SectionRenderer = (props: SectionProps) => ReactNode;

export type WorldSections = Record<SectionId, SectionRenderer>;
