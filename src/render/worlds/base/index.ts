import { About } from "./About";
import { Contact } from "./Contact";
import { Experience } from "./Experience";
import { Hero } from "./Hero";
import { Projects } from "./Projects";
import { Skills } from "./Skills";
import type { WorldSections } from "../types";

export const baseWorld: WorldSections = {
  hero: Hero,
  about: About,
  projects: Projects,
  skills: Skills,
  experience: Experience,
  contact: Contact,
};
