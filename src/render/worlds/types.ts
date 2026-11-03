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

export type NavigationItem = {
  id: SectionId;
  label: string;
  index: number;
};

export type ShellProps = {
  profile: Profile;
  navigation: readonly NavigationItem[];
  children: ReactNode;
};

export type Shell = (props: ShellProps) => ReactNode;

export type World = {
  Shell: Shell;
  sections: Record<SectionId, SectionRenderer>;
};

export type WorldSections = Record<SectionId, SectionRenderer>;
