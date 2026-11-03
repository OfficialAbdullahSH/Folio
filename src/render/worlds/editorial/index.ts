import type { World } from "../types";
import { EditorialAbout } from "./About";
import { EditorialContact } from "./Contact";
import { EditorialExperience } from "./Experience";
import { EditorialHero } from "./Hero";
import { EditorialProjects } from "./Projects";
import { EditorialShell } from "./Shell";
import { EditorialSkills } from "./Skills";

export const editorialWorld: World = {
  Shell: EditorialShell,
  sections: {
    hero: EditorialHero,
    about: EditorialAbout,
    projects: EditorialProjects,
    skills: EditorialSkills,
    experience: EditorialExperience,
    contact: EditorialContact,
  },
};
