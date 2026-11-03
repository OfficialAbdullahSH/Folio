import type { World } from "../types";
import { TerminalAbout } from "./About";
import { TerminalContact } from "./Contact";
import { TerminalExperience } from "./Experience";
import { TerminalHero } from "./Hero";
import { TerminalProjects } from "./Projects";
import { TerminalShell } from "./Shell";
import { TerminalSkills } from "./Skills";

export const terminalWorld: World = {
  Shell: TerminalShell,
  sections: {
    hero: TerminalHero,
    about: TerminalAbout,
    projects: TerminalProjects,
    skills: TerminalSkills,
    experience: TerminalExperience,
    contact: TerminalContact,
  },
};
