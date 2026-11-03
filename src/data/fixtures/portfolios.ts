import type { PortfolioRecord } from "@/render/types";

const demoEditorial: PortfolioRecord = {
  profile: {
    username: "demo-editorial",
    displayName: "Amelia Hart",
    headline: "Product designer and front-end engineer",
  },
  design: {
    version: 1,
    world: "editorial",
    theme: {
      colors: {
        background: "#faf7f2",
        surface: "#ffffff",
        text: "#1c1917",
        muted: "#57534e",
        accent: "#b45309",
        border: "#e7e5e4",
      },
      headingFont: "playfair-display",
      bodyFont: "inter",
      radius: "md",
    },
    sections: [
      { id: "hero", visible: true, displayStyle: "large" },
      { id: "about", visible: true },
      { id: "projects", visible: true, displayStyle: "cards" },
      { id: "skills", visible: true, displayStyle: "tags" },
      { id: "experience", visible: true, displayStyle: "timeline" },
      { id: "contact", visible: true },
    ],
  },
  content: {
    version: 1,
    about: {
      text: "I design and build calm, readable interfaces for teams that publish a lot of data.\n\nMost of my work sits where design systems meet front-end code: tokens, component libraries, and the small interactions that make a page feel finished.",
    },
    projects: {
      items: [
        {
          id: "1a1a1111-1111-4111-8111-111111111111",
          title: "Northwind Analytics",
          description:
            "A reporting product for retail buyers. I rebuilt the chart library and cut time to first chart from four seconds to under one.",
          imageUrl: "https://picsum.photos/seed/northwind/800/500",
          link: "https://example.com/northwind",
        },
        {
          id: "1a1a1111-1111-4111-8111-111111111112",
          title: "Folio",
          description:
            "A portfolio builder where the whole page comes from two JSON documents. Design tokens, sections, and content stay separate.",
          imageUrl: "https://picsum.photos/seed/folio/800/500",
          link: "https://example.com/folio",
        },
        {
          id: "1a1a1111-1111-4111-8111-111111111113",
          title: "Kettle",
          description:
            "A reading app for long-form journalism. Offline-first, one column, no infinite scroll.",
          imageUrl: "https://picsum.photos/seed/kettle/800/500",
        },
        {
          id: "1a1a1111-1111-4111-8111-111111111114",
          title: "Museum of Small Things",
          description:
            "A catalogue for a local history archive, with search that works on a phone with one thumb.",
          link: "https://example.com/small-things",
        },
      ],
    },
    skills: {
      skillIds: [
        "typescript",
        "react",
        "nextjs",
        "figma",
        "accessibility",
        "design-systems",
        "tailwind-css",
      ],
    },
    experience: {
      items: [
        {
          id: "2b2b2222-2222-4222-8222-222222222221",
          kind: "experience",
          title: "Senior Product Designer",
          organization: "Northwind",
          startDate: "2022-03",
          current: true,
          description:
            "Design lead for the reporting suite. I run the design system, pair with engineers, and own the accessibility review.",
        },
        {
          id: "2b2b2222-2222-4222-8222-222222222222",
          kind: "experience",
          title: "Front-end Engineer",
          organization: "Lumen Studio",
          startDate: "2019-06",
          endDate: "2022-02",
          description:
            "Built marketing sites and internal tools in React. Introduced a shared component library across six client projects.",
        },
        {
          id: "2b2b2222-2222-4222-8222-222222222223",
          kind: "education",
          title: "BSc Computer Science",
          organization: "University of Leeds",
          startDate: "2015-09",
          endDate: "2018-06",
        },
      ],
    },
    contact: {
      items: [
        {
          id: "3c3c3333-3333-4333-8333-333333333331",
          kind: "email",
          label: "amelia@example.com",
          value: "amelia@example.com",
        },
        {
          id: "3c3c3333-3333-4333-8333-333333333332",
          kind: "github",
          label: "GitHub",
          value: "https://github.com/amelia-hart",
        },
        {
          id: "3c3c3333-3333-4333-8333-333333333333",
          kind: "linkedin",
          label: "LinkedIn",
          value: "https://www.linkedin.com/in/amelia-hart",
        },
      ],
    },
  },
};

const demoTerminal: PortfolioRecord = {
  profile: {
    username: "demo-terminal",
    displayName: "Devon Reyes",
    headline: "Backend engineer, systems and data",
  },
  design: {
    version: 1,
    world: "terminal",
    theme: {
      colors: {
        background: "#0b0b0d",
        surface: "#15161a",
        text: "#e7e7ea",
        muted: "#9a9aa3",
        accent: "#5eead4",
        border: "#26272e",
      },
      headingFont: "jetbrains-mono",
      bodyFont: "space-grotesk",
      radius: "sm",
    },
    sections: [
      { id: "hero", visible: true, displayStyle: "compact" },
      { id: "about", visible: true },
      { id: "projects", visible: true, displayStyle: "grid" },
      { id: "skills", visible: true, displayStyle: "list" },
      { id: "experience", visible: true, displayStyle: "list" },
      { id: "contact", visible: true },
    ],
  },
  content: {
    version: 1,
    about: {
      text: "I build data pipelines and the APIs on top of them. Nine years of PostgreSQL, six of them on teams where the query plan is the product.\n\nI write short design notes before code, and I keep runbooks next to the services they describe.",
    },
    projects: {
      items: [
        {
          id: "4d4d4444-4444-4444-8444-444444444441",
          title: "Ledger Sync",
          description:
            "A reconciliation service that replays payment events into a warehouse. Handles about forty million rows a day.",
          imageUrl: "https://picsum.photos/seed/ledger/800/500",
          link: "https://example.com/ledger-sync",
        },
        {
          id: "4d4d4444-4444-4444-8444-444444444442",
          title: "Query Budget",
          description:
            "A Postgres extension that fails slow queries in staging before they reach production.",
          imageUrl: "https://picsum.photos/seed/query-budget/800/500",
        },
        {
          id: "4d4d4444-4444-4444-8444-444444444443",
          title: "Open Ledger Format",
          description:
            "A small file format for double-entry bookkeeping, with parsers in Python and TypeScript.",
          link: "https://example.com/open-ledger",
        },
      ],
    },
    skills: {
      skillIds: ["python", "postgresql", "node-js", "typescript", "sql", "dbt"],
    },
    experience: {
      items: [
        {
          id: "6f6f6666-6666-4666-8666-666666666661",
          kind: "experience",
          title: "Staff Engineer, Data Platform",
          organization: "Ledger Works",
          startDate: "2021-01",
          current: true,
          description:
            "Own the ingestion platform: schema registry, replay tooling, and the on-call runbooks.",
        },
        {
          id: "6f6f6666-6666-4666-8666-666666666662",
          kind: "education",
          title: "MSc Data Engineering",
          organization: "Technical University of Munich",
          startDate: "2016-10",
          endDate: "2018-09",
        },
      ],
    },
    contact: {
      items: [
        {
          id: "7a7a7777-7777-4777-8777-777777777771",
          kind: "email",
          label: "devon@example.com",
          value: "devon@example.com",
        },
        {
          id: "7a7a7777-7777-4777-8777-777777777772",
          kind: "github",
          label: "github.com/devon-reyes",
          value: "https://github.com/devon-reyes",
        },
        {
          id: "7a7a7777-7777-4777-8777-777777777773",
          kind: "website",
          label: "devonreyes.example.com",
          value: "https://devonreyes.example.com",
        },
      ],
    },
  },
};

const demoMinimal: PortfolioRecord = {
  profile: {
    username: "demo-minimal",
    displayName: "ليلى الحربي",
    headline: "مصممة واجهات ومهندسة واجهات أمامية",
  },
  design: {
    version: 1,
    world: "editorial",
    theme: {
      colors: {
        background: "#fdfdfc",
        surface: "#f6f5f3",
        text: "#171717",
        muted: "#6b6b6b",
        accent: "#0f766e",
        border: "#e5e3df",
      },
      headingFont: "cairo",
      bodyFont: "cairo",
      radius: "lg",
    },
    sections: [
      { id: "hero", visible: true, displayStyle: "large" },
      { id: "about", visible: true },
      { id: "projects", visible: true, displayStyle: "grid" },
      { id: "skills", visible: true, displayStyle: "tags" },
      { id: "experience", visible: false, displayStyle: "timeline" },
      { id: "contact", visible: true },
    ],
  },
  content: {
    version: 1,
    about: {
      text: "أصمّم واجهات عربية واضحة وسهلة القراءة، وأكتب الواجهة الأمامية لها.\n\nأعمل على تنظيم المسافات والخطوط أولاً، ثم أبني المكوّنات التي تعيد استخدامها الفرق.",
    },
    projects: {
      items: [
        {
          id: "8b8b8888-8888-4888-8888-888888888881",
          title: "دفتر المدرسة",
          description: "تطبيق لمتابعة الواجبات اليومية، بواجهة عربية بالكامل.",
        },
      ],
    },
    skills: { skillIds: [] },
    experience: { items: [] },
    contact: { items: [] },
  },
};
const demoCompact: PortfolioRecord = {
  profile: {
    username: "demo-compact",
    displayName: "Rae Molina",
    headline: "Interaction designer for small teams",
  },
  design: {
    version: 1,
    world: "terminal",
    theme: {
      colors: {
        background: "#101014",
        surface: "#191a1f",
        text: "#f2f2f4",
        muted: "#a1a1aa",
        accent: "#fbbf24",
        border: "#2c2d35",
      },
      headingFont: "space-grotesk",
      bodyFont: "inter",
      radius: "none",
    },
    sections: [
      { id: "hero", visible: true, displayStyle: "compact" },
      { id: "about", visible: false },
      { id: "projects", visible: true, displayStyle: "timeline" },
      { id: "skills", visible: true, displayStyle: "tags" },
      { id: "experience", visible: true, displayStyle: "timeline" },
      { id: "contact", visible: false },
    ],
  },
  content: {
    version: 1,
    about: { text: "Hidden on this portfolio, kept in the document." },
    projects: {
      items: [
        {
          id: "acacaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
          title: "Field Notes",
          description: "A notebook for research sessions, with a keyboard-first outline.",
        },
        {
          id: "acacaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
          title: "Shelf",
          description: "A reading list that a small team can share.",
        },
      ],
    },
    skills: { skillIds: ["figma", "react", "tailwind-css"] },
    experience: {
      items: [
        {
          id: "acacaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3",
          kind: "experience",
          title: "Product Designer",
          organization: "Field Studio",
          startDate: "2020-04",
          current: true,
        },
      ],
    },
    contact: { items: [] },
  },
};

const demoLong: PortfolioRecord = {
  profile: {
    username: "demo-long",
    displayName: "Wolfeschlegelsteinhausenbergerdorffvoralternwaren",
    headline:
      "Backend engineer working on data platforms, storage systems and the tooling around them.",
  },
  design: {
    version: 1,
    world: "terminal",
    theme: {
      colors: {
        background: "#f8fafc",
        surface: "#ffffff",
        text: "#0f172a",
        muted: "#64748b",
        accent: "#1d4ed8",
        border: "#e2e8f0",
      },
      headingFont: "inter",
      bodyFont: "lora",
      radius: "lg",
    },
    sections: [
      { id: "hero", visible: true, displayStyle: "large" },
      { id: "about", visible: true },
      { id: "projects", visible: true, displayStyle: "grid" },
      { id: "skills", visible: true, displayStyle: "list" },
      { id: "experience", visible: true, displayStyle: "list" },
      { id: "contact", visible: true },
    ],
  },
  content: {
    version: 1,
    about: {
      text: "I work on storage and query systems. Most of the job is making a slow path visible before it becomes an incident.",
    },
    projects: {
      items: [
        {
          id: "bcbcaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
          title: "QueryBudgetReconciliationServiceForPaymentEvents",
          description: "",
        },
        {
          id: "bcbcaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
          title: "ReplayableEventStoreWithDeterministicSnapshots",
          description: "",
        },
      ],
    },
    skills: { skillIds: ["postgresql", "sql"] },
    experience: {
      items: [
        {
          id: "bcbcaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3",
          kind: "experience",
          title: "PrincipalEngineerForStorageAndQuerySystems",
          organization: "Ledger Works",
          startDate: "2018-01",
          current: true,
        },
        {
          id: "bcbcaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4",
          kind: "education",
          title: "BSc Computer Science",
          organization: "University of Leeds",
          startDate: "2013-09",
          endDate: "2016-06",
        },
      ],
    },
    contact: {
      items: [
        {
          id: "bcbcaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5",
          kind: "email",
          label: "hello@example.com",
          value: "hello@example.com",
        },
      ],
    },
  },
};

const demoEditorialBold: PortfolioRecord = {
  profile: {
    username: "demo-editorial-bold",
    displayName: "Nadia Osei",
    headline: "Editorial designer, type and layout",
  },
  design: {
    version: 1,
    world: "editorial",
    theme: {
      colors: {
        background: "#f4e04d",
        surface: "#fff6b8",
        text: "#111111",
        muted: "#4a4a2a",
        accent: "#d6249f",
        border: "#111111",
      },
      headingFont: "space-grotesk",
      bodyFont: "inter",
      radius: "none",
    },
    sections: [
      { id: "hero", visible: true, displayStyle: "compact" },
      { id: "about", visible: true },
      { id: "projects", visible: true, displayStyle: "grid" },
      { id: "skills", visible: true, displayStyle: "list" },
      { id: "experience", visible: true, displayStyle: "list" },
      { id: "contact", visible: true },
    ],
  },
  content: {
    version: 1,
    about: {
      text: "I design magazines, catalogues and the occasional very loud poster. Most of the work is deciding what the reader sees first.\n\nI set type in long sittings, draw grids on paper, and hand engineers a layout they can build without guessing.",
    },
    projects: {
      items: [
        {
          id: "d1d1dddd-dddd-4ddd-8ddd-dddddddddd01",
          title: "The Quarterly",
          description:
            "A four-issue arts journal with a different grid for every issue and one shared type system.",
          imageUrl: "https://picsum.photos/seed/quarterly/800/500",
          link: "https://example.com/quarterly",
        },
        {
          id: "d1d1dddd-dddd-4ddd-8ddd-dddddddddd02",
          title: "Market Hall",
          description:
            "Wayfinding and print for a covered market: ninety signs, three languages, one palette.",
          imageUrl: "https://picsum.photos/seed/market-hall/800/500",
        },
        {
          id: "d1d1dddd-dddd-4ddd-8ddd-dddddddddd03",
          title: "Type Notes",
          description:
            "A small journal about typefaces in use, set entirely in the faces it discusses.",
          link: "https://example.com/type-notes",
        },
      ],
    },
    skills: {
      skillIds: [
        "figma",
        "design-systems",
        "accessibility",
        "tailwind-css",
        "react",
        "typescript",
      ],
    },
    experience: {
      items: [
        {
          id: "d2d2dddd-dddd-4ddd-8ddd-dddddddddd01",
          kind: "experience",
          title: "Design Director",
          organization: "Osei Studio",
          startDate: "2020-09",
          current: true,
          description:
            "Run a two-person studio for cultural clients. I art-direct, set the type, and build the web versions.",
        },
        {
          id: "d2d2dddd-dddd-4ddd-8ddd-dddddddddd02",
          kind: "experience",
          title: "Senior Designer",
          organization: "Hatch Press",
          startDate: "2016-04",
          endDate: "2020-08",
          description:
            "Redesigned the press catalogue and the subscription system that ships it.",
        },
        {
          id: "d2d2dddd-dddd-4ddd-8ddd-dddddddddd03",
          kind: "education",
          title: "BA Graphic Design",
          organization: "Central Saint Martins",
          startDate: "2012-09",
          endDate: "2015-06",
        },
      ],
    },
    contact: {
      items: [
        {
          id: "d3d3dddd-dddd-4ddd-8ddd-dddddddddd01",
          kind: "email",
          label: "nadia@example.com",
          value: "nadia@example.com",
        },
        {
          id: "d3d3dddd-dddd-4ddd-8ddd-dddddddddd02",
          kind: "website",
          label: "osei.studio",
          value: "https://osei.example.com",
        },
        {
          id: "d3d3dddd-dddd-4ddd-8ddd-dddddddddd03",
          kind: "x",
          label: "@nadiaosei",
          value: "https://x.com/nadiaosei",
        },
      ],
    },
  },
};

const demoTerminalLight: PortfolioRecord = {
  profile: {
    username: "demo-terminal-light",
    displayName: "Iris Chen",
    headline: "Front-end engineer, design systems and accessibility",
  },
  design: {
    version: 1,
    world: "terminal",
    theme: {
      colors: {
        background: "#f6f3ea",
        surface: "#ffffff",
        text: "#2b2b2b",
        muted: "#6b6b5e",
        accent: "#0b7a5b",
        border: "#cfc9b8",
      },
      headingFont: "lora",
      bodyFont: "inter",
      radius: "lg",
    },
    sections: [
      { id: "hero", visible: true, displayStyle: "compact" },
      { id: "about", visible: true },
      { id: "projects", visible: true, displayStyle: "cards" },
      { id: "skills", visible: true, displayStyle: "tags" },
      { id: "experience", visible: true, displayStyle: "timeline" },
      { id: "contact", visible: true },
    ],
  },
  content: {
    version: 1,
    about: {
      text: "I build interfaces that hold up under a keyboard and a screen reader. Most of my week is spent in a component library, a test file and a browser.\n\nI like small APIs, plain HTML and documentation that a new teammate can follow on their first day.",
    },
    projects: {
      items: [
        {
          id: "e1e1eeee-eeee-4eee-8eee-eeeeeeeeee01",
          title: "Atlas Components",
          description:
            "A component library with one accessibility contract per component, checked in CI.",
          imageUrl: "https://picsum.photos/seed/atlas-components/800/500",
          link: "https://example.com/atlas",
        },
        {
          id: "e1e1eeee-eeee-4eee-8eee-eeeeeeeeee02",
          title: "Reading Room",
          description:
            "A long-form reading app with adjustable type, offline caching and no tracking.",
          imageUrl: "https://picsum.photos/seed/reading-room/800/500",
        },
        {
          id: "e1e1eeee-eeee-4eee-8eee-eeeeeeeeee03",
          title: "Focus Audit",
          description:
            "A browser extension that lists every focusable element and where the focus ring goes missing.",
          link: "https://example.com/focus-audit",
        },
      ],
    },
    skills: {
      skillIds: ["typescript", "react", "nextjs", "accessibility", "design-systems"],
    },
    experience: {
      items: [
        {
          id: "e2e2eeee-eeee-4eee-8eee-eeeeeeeeee01",
          kind: "experience",
          title: "Principal Front-end Engineer",
          organization: "Fieldwork",
          startDate: "2021-06",
          current: true,
          description:
            "Own the shared front-end: component library, accessibility reviews and the upgrade path.",
        },
        {
          id: "e2e2eeee-eeee-4eee-8eee-eeeeeeeeee02",
          kind: "experience",
          title: "Front-end Engineer",
          organization: "Common Thread",
          startDate: "2018-02",
          endDate: "2021-05",
          description:
            "Built the publishing tools that the editorial team uses every day.",
        },
        {
          id: "e2e2eeee-eeee-4eee-8eee-eeeeeeeeee03",
          kind: "education",
          title: "BSc Software Engineering",
          organization: "University of Bristol",
          startDate: "2014-09",
          endDate: "2017-06",
        },
      ],
    },
    contact: {
      items: [
        {
          id: "e3e3eeee-eeee-4eee-8eee-eeeeeeeeee01",
          kind: "email",
          label: "iris@example.com",
          value: "iris@example.com",
        },
        {
          id: "e3e3eeee-eeee-4eee-8eee-eeeeeeeeee02",
          kind: "github",
          label: "github.com/iris-chen",
          value: "https://github.com/iris-chen",
        },
        {
          id: "e3e3eeee-eeee-4eee-8eee-eeeeeeeeee03",
          kind: "linkedin",
          label: "Iris Chen",
          value: "https://www.linkedin.com/in/iris-chen",
        },
      ],
    },
  },
};


export const fixturePortfolios: Record<string, PortfolioRecord> = {
  "demo-editorial": demoEditorial,
  "demo-terminal": demoTerminal,
  "demo-minimal": demoMinimal,
  "demo-compact": demoCompact,
  "demo-long": demoLong,
  "demo-editorial-bold": demoEditorialBold,
  "demo-terminal-light": demoTerminalLight,
};
