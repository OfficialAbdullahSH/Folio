import { Fragment } from "react";

import type { ContentDocument, DesignDocument, Profile } from "@/schema";

import { buildNavigation, renderedSections } from "./sections";
import { ThemeScope } from "./theme";
import type { SkillNames } from "./types";
import { worldRegistry } from "./worlds/registry";

export type PortfolioProps = {
  profile: Profile;
  design: DesignDocument;
  content: ContentDocument;
  skills: SkillNames;
};

export function Portfolio({ profile, design, content, skills }: PortfolioProps) {
  const world = worldRegistry[design.world];
  const sections = renderedSections(design, content);
  const navigation = buildNavigation(sections);

  return (
    <ThemeScope theme={design.theme} world={design.world}>
      <world.Shell profile={profile} navigation={navigation}>
        {sections.map((section) => (
          <Fragment key={section.id}>
            {world.sections[section.id]({ section, profile, content, skills })}
          </Fragment>
        ))}
      </world.Shell>
    </ThemeScope>
  );
}
