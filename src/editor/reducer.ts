import { LIMITS } from "@/schema";
import type { ContactItem, ContentDocument, ExperienceItem, ProjectItem } from "@/schema";

/**
 * The editor's whole state, and the only way it changes (D-068).
 *
 * Everything here is a pure function of `(state, action)`. Ids and the current
 * month arrive on the action instead of being read from the clock or the crypto
 * module inside the reducer, so a test can drive every branch with fixed input.
 */

export type EditorProfile = {
  displayName: string;
  headline: string;
};

export type EditorState = {
  content: ContentDocument;
  profile: EditorProfile;
};

export type MoveDirection = "up" | "down";

export type ProjectTextField = "title" | "description" | "link";
export type ExperienceTextField = "title" | "organization" | "description";
export type ContactTextField = "label" | "value";
export type ProfileTextField = keyof EditorProfile;

export type EditorAction =
  | { type: "setProfileField"; field: ProfileTextField; value: string }
  | { type: "setAbout"; value: string }
  | { type: "addProject"; id: string }
  | { type: "removeProject"; id: string }
  | { type: "moveProject"; id: string; direction: MoveDirection }
  | { type: "setProjectField"; id: string; field: ProjectTextField; value: string }
  | { type: "setProjectImage"; id: string; value: string | undefined }
  | { type: "addSkill"; slug: string }
  | { type: "removeSkill"; slug: string }
  | { type: "addExperience"; id: string; startDate: string }
  | { type: "removeExperience"; id: string }
  | { type: "moveExperience"; id: string; direction: MoveDirection }
  | { type: "setExperienceKind"; id: string; kind: ExperienceItem["kind"] }
  | { type: "setExperienceField"; id: string; field: ExperienceTextField; value: string }
  | { type: "setExperienceStart"; id: string; value: string }
  | { type: "setExperienceEnd"; id: string; value: string | undefined }
  | { type: "toggleExperienceCurrent"; id: string }
  | { type: "addContact"; id: string }
  | { type: "removeContact"; id: string }
  | { type: "moveContact"; id: string; direction: MoveDirection }
  | { type: "setContactKind"; id: string; kind: ContactItem["kind"] }
  | { type: "setContactField"; id: string; field: ContactTextField; value: string };


/** A fresh v4 UUID for a new list item. Called by the component, not the reducer. */
export function newItemId(): string {
  return globalThis.crypto.randomUUID();
}

/** The month a new experience item starts at, as `YYYY-MM`. */
export function currentYearMonth(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${date.getFullYear()}-${month}`;
}

export function editorStateFrom(
  profile: EditorProfile,
  content: ContentDocument,
): EditorState {
  return { profile: { ...profile }, content: structuredClone(content) };
}

/**
 * `maxLength` on the input is the first guard; this is the second, so a paste that
 * bypasses it cannot produce a value the schema rejects (AC-3).
 */
function clip(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}

function withoutKey<T extends object, K extends keyof T>(item: T, key: K): Omit<T, K> {
  const next = { ...item };
  delete next[key];
  return next;
}

function profilePatch(
  current: EditorProfile,
  field: ProfileTextField,
  value: string,
): EditorProfile {
  return field === "displayName"
    ? { ...current, displayName: clip(value, LIMITS.displayName) }
    : { ...current, headline: clip(value, LIMITS.headline) };
}

function projectPatch(field: ProjectTextField, value: string): Partial<ProjectItem> {
  switch (field) {
    case "title":
      return { title: clip(value, LIMITS.projectTitle) };
    case "description":
      return { description: clip(value, LIMITS.projectDescription) };
    case "link":
      return { link: clip(value, LIMITS.url) };
  }
}

function experiencePatch(
  field: ExperienceTextField,
  value: string,
): Partial<ExperienceItem> {
  switch (field) {
    case "title":
      return { title: clip(value, LIMITS.experienceTitle) };
    case "organization":
      return { organization: clip(value, LIMITS.experienceOrganization) };
    case "description":
      return { description: clip(value, LIMITS.experienceDescription) };
  }
}

function contactPatch(field: ContactTextField, value: string): Partial<ContactItem> {
  return field === "label"
    ? { label: clip(value, LIMITS.contactLabel) }
    : { value: clip(value, LIMITS.url) };
}

function replaceAt<T>(items: readonly T[], index: number, next: T): T[] {
  return items.map((item, position) => (position === index ? next : item));
}

/**
 * Moves one item by one place. Returns null when the move is impossible — an
 * unknown id, the first item going up, the last going down — so the caller can
 * return the same state object and React skips the re-render (AC-3).
 */
function moved<T>(items: readonly T[], index: number, direction: MoveDirection): T[] | null {
  const target = direction === "up" ? index - 1 : index + 1;

  if (index < 0 || target < 0 || target >= items.length) {
    return null;
  }

  const next = [...items];
  const [item] = next.splice(index, 1);

  if (item === undefined) {
    return null;
  }

  next.splice(target, 0, item);

  return next;
}

function indexOfId(items: readonly { id: string }[], id: string): number {
  return items.findIndex((item) => item.id === id);
}

function updateProject(
  state: EditorState,
  id: string,
  update: (project: ProjectItem) => ProjectItem,
): EditorState {
  const items = state.content.projects.items;
  const index = indexOfId(items, id);

  if (index === -1) {
    return state;
  }

  return {
    ...state,
    content: {
      ...state.content,
      projects: { items: replaceAt(items, index, update(items[index]!)) },
    },
  };
}

function updateExperience(
  state: EditorState,
  id: string,
  update: (item: ExperienceItem) => ExperienceItem,
): EditorState {
  const items = state.content.experience.items;
  const index = indexOfId(items, id);

  if (index === -1) {
    return state;
  }

  return {
    ...state,
    content: {
      ...state.content,
      experience: { items: replaceAt(items, index, update(items[index]!)) },
    },
  };
}

function updateContact(
  state: EditorState,
  id: string,
  update: (item: ContactItem) => ContactItem,
): EditorState {
  const items = state.content.contact.items;
  const index = indexOfId(items, id);

  if (index === -1) {
    return state;
  }

  return {
    ...state,
    content: {
      ...state.content,
      contact: { items: replaceAt(items, index, update(items[index]!)) },
    },
  };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "setProfileField":
      return {
        ...state,
        profile: profilePatch(state.profile, action.field, action.value),
      };

    case "setAbout":
      return {
        ...state,
        content: {
          ...state.content,
          about: { text: clip(action.value, LIMITS.aboutText) },
        },
      };

    case "addProject": {
      const items = state.content.projects.items;

      if (items.length >= LIMITS.projects) {
        return state;
      }

      const project: ProjectItem = { id: action.id, title: "", description: "" };

      return {
        ...state,
        content: { ...state.content, projects: { items: [...items, project] } },
      };
    }

    case "removeProject": {
      const items = state.content.projects.items.filter((item) => item.id !== action.id);

      if (items.length === state.content.projects.items.length) {
        return state;
      }

      return { ...state, content: { ...state.content, projects: { items } } };
    }

    case "moveProject": {
      const items = state.content.projects.items;
      const next = moved(items, indexOfId(items, action.id), action.direction);

      return next === null
        ? state
        : { ...state, content: { ...state.content, projects: { items: next } } };
    }

    case "setProjectField":
      return updateProject(state, action.id, (project) => ({
        ...project,
        ...projectPatch(action.field, action.value),
      }));

    case "setProjectImage":
      return updateProject(state, action.id, (project) => {
        const base = withoutKey(project, "imageUrl");

        return action.value === undefined || action.value === ""
          ? base
          : { ...base, imageUrl: action.value };
      });

    case "addSkill": {
      const slug = action.slug.trim();

      if (
        slug.length === 0 ||
        slug.length > LIMITS.skillSlug ||
        state.content.skills.skillIds.includes(slug) ||
        state.content.skills.skillIds.length >= LIMITS.skillIds
      ) {
        return state;
      }

      return {
        ...state,
        content: {
          ...state.content,
          skills: { skillIds: [...state.content.skills.skillIds, slug] },
        },
      };
    }

    case "removeSkill": {
      const skillIds = state.content.skills.skillIds.filter((slug) => slug !== action.slug);

      if (skillIds.length === state.content.skills.skillIds.length) {
        return state;
      }

      return { ...state, content: { ...state.content, skills: { skillIds } } };
    }

    case "addExperience": {
      const items = state.content.experience.items;

      if (items.length >= LIMITS.experience) {
        return state;
      }

      const item: ExperienceItem = {
        id: action.id,
        kind: "experience",
        title: "",
        organization: "",
        startDate: action.startDate,
        current: true,
      };

      return {
        ...state,
        content: { ...state.content, experience: { items: [...items, item] } },
      };
    }

    case "removeExperience": {
      const items = state.content.experience.items.filter((item) => item.id !== action.id);

      if (items.length === state.content.experience.items.length) {
        return state;
      }

      return { ...state, content: { ...state.content, experience: { items } } };
    }

    case "moveExperience": {
      const items = state.content.experience.items;
      const next = moved(items, indexOfId(items, action.id), action.direction);

      return next === null
        ? state
        : { ...state, content: { ...state.content, experience: { items: next } } };
    }

    case "setExperienceKind":
      return updateExperience(state, action.id, (item) => ({
        ...item,
        kind: action.kind,
      }));

    case "setExperienceField":
      return updateExperience(state, action.id, (item) => ({
        ...item,
        ...experiencePatch(action.field, action.value),
      }));

    case "setExperienceStart":
      return updateExperience(state, action.id, (item) => ({
        ...item,
        startDate: action.value,
      }));

    case "setExperienceEnd":
      return updateExperience(state, action.id, (item) => {
        const base = withoutKey(item, "endDate");

        return action.value === undefined || action.value === ""
          ? base
          : { ...base, endDate: action.value, current: false };
      });

    case "toggleExperienceCurrent":
      return updateExperience(state, action.id, (item) =>
        item.current === true
          ? { ...item, current: false }
          : { ...withoutKey(item, "endDate"), current: true },
      );

    case "addContact": {
      const items = state.content.contact.items;

      if (items.length >= LIMITS.contact) {
        return state;
      }

      const item: ContactItem = { id: action.id, kind: "email", label: "", value: "" };

      return {
        ...state,
        content: { ...state.content, contact: { items: [...items, item] } },
      };
    }

    case "removeContact": {
      const items = state.content.contact.items.filter((item) => item.id !== action.id);

      if (items.length === state.content.contact.items.length) {
        return state;
      }

      return { ...state, content: { ...state.content, contact: { items } } };
    }

    case "moveContact": {
      const items = state.content.contact.items;
      const next = moved(items, indexOfId(items, action.id), action.direction);

      return next === null
        ? state
        : { ...state, content: { ...state.content, contact: { items: next } } };
    }

    case "setContactKind":
      return updateContact(state, action.id, (item) => ({
        ...item,
        kind: action.kind,
      }));

    case "setContactField":
      return updateContact(state, action.id, (item) => ({
        ...item,
        ...contactPatch(action.field, action.value),
      }));
  }
}
