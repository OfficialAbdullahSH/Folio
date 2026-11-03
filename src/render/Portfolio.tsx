import { Fragment } from "react";

import type { ContentDocument, DesignDocument, Profile } from "@/schema";

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

  return (
    <ThemeScope theme={design.theme}>
      <main className="mx-auto w-full max-w-3xl px-5 pb-20 sm:px-8">
        {design.sections.map((section) => {
          if (!section.visible && section.id !== "hero") {
            return null;
          }

          const renderSection = world[section.id];

          return (
            <Fragment key={section.id}>
              {renderSection({ section, profile, content, skills })}
            </Fragment>
          );
        })}
      </main>
    </ThemeScope>
  );
}
