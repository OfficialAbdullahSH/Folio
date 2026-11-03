import type { ContentDocument } from "../content.schema";

export const fullContent: ContentDocument = {
  version: 1,
  about: {
    text: "I build interfaces that stay readable when the content is not.\n\nMost of my work is front-end architecture and design systems.",
  },
  projects: {
    items: [
      {
        id: "0f0b6f5e-3a2b-4c1d-8e9f-1a2b3c4d5e6f",
        title: "Folio",
        description: "A portfolio builder where design is data.",
        imageUrl: "https://example.com/folio.png",
        link: "https://example.com/folio",
      },
      {
        id: "1a1c7f6d-4b3c-5d2e-9f0a-2b3c4d5e6f70",
        title: "Ledger",
        description: "Offline-first expense tracking.",
      },
    ],
  },
  skills: { skillIds: ["typescript", "react", "postgresql", "accessibility"] },
  experience: {
    items: [
      {
        id: "2b2d8a7e-5c4d-6e3f-a01b-3c4d5e6f7081",
        kind: "experience",
        title: "Front-end Engineer",
        organization: "Northwind",
        startDate: "2023-06",
        current: true,
        description: "Design system and accessibility work.",
      },
      {
        id: "3c3e9b8f-6d5e-7f40-b12c-4d5e6f708192",
        kind: "education",
        title: "BSc Software Engineering",
        organization: "University",
        startDate: "2019-09",
        endDate: "2023-05",
      },
    ],
  },
  contact: {
    items: [
      {
        id: "4d4fac90-7e6f-4051-823d-5e6f708192a3",
        kind: "email",
        label: "Email",
        value: "abdullah@example.com",
      },
      {
        id: "5e50bda1-8f70-4162-934e-6f708192a3b4",
        kind: "github",
        label: "GitHub",
        value: "https://github.com/abdullah",
      },
    ],
  },
};

export const emptyContent: ContentDocument = {
  version: 1,
  about: { text: "" },
  projects: { items: [] },
  skills: { skillIds: [] },
  experience: { items: [] },
  contact: { items: [] },
};
