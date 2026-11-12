/**
 * The demo portfolios the search page shows something with (D-093).
 *
 * Ten fictional people, written here as data and validated with the F-02 validators
 * before any SQL is produced, so the seed cannot ship a design or a content document
 * the renderer would refuse. `scripts/generate-demo-seed.ts` writes the two SQL
 * files, and a test asserts the committed files match what this module builds.
 *
 * The people are invented. Every username starts with `demo-`, and every address
 * ends in the reserved domain `demo.folio.invalid`, so a demo cannot be mistaken
 * for a real owner and no mail can be sent to one.
 */

import {
  validateContent,
  validateDesign,
  validateProfile,
  type ContentDocument,
  type DesignDocument,
  type DesignTheme,
  type Profile,
  type SectionId,
} from "../schema";

export const DEMO_EMAIL_DOMAIN = "demo.folio.invalid";

/** Every demo user id starts with this, so the removal file can name them exactly. */
export const DEMO_ID_PREFIX = "d0000000-0000-4000-8000-";

export type DemoPortfolio = {
  id: string;
  profile: Profile;
  design: DesignDocument;
  content: ContentDocument;
  publishedAt: string;
};

const demoId = (n: number) => `${DEMO_ID_PREFIX}${String(n).padStart(12, "0")}`;

const itemId = (person: number, kind: 1 | 2 | 3, index: number) =>
  demoId(person * 10_000 + kind * 100 + index);

export const demoEmail = (username: string) => `${username}@${DEMO_EMAIL_DOMAIN}`;

function sectionsFor(
  order: readonly SectionId[],
  options: {
    hero?: "large" | "compact";
    projects?: "grid" | "cards" | "timeline";
    skills?: "tags" | "list";
    experience?: "timeline" | "list";
    hidden?: readonly SectionId[];
  } = {},
): DesignDocument["sections"] {
  const hidden = new Set(options.hidden ?? []);

  return order.map((id) => {
    const visible = !hidden.has(id);

    switch (id) {
      case "hero":
        return { id, visible, displayStyle: options.hero ?? "large" };
      case "about":
        return { id, visible };
      case "projects":
        return { id, visible, displayStyle: options.projects ?? "cards" };
      case "skills":
        return { id, visible, displayStyle: options.skills ?? "tags" };
      case "experience":
        return { id, visible, displayStyle: options.experience ?? "timeline" };
      case "contact":
        return { id, visible };
    }
  });
}

const theme = (
  colors: DesignTheme["colors"],
  headingFont: DesignTheme["headingFont"],
  bodyFont: DesignTheme["bodyFont"],
  radius: DesignTheme["radius"],
): DesignTheme => ({ colors, headingFont, bodyFont, radius });

const PAPER = theme(
  {
    background: "#faf7f2",
    surface: "#ffffff",
    text: "#1c1917",
    muted: "#57534e",
    accent: "#b45309",
    border: "#e7e5e4",
  },
  "playfair-display",
  "inter",
  "md",
);

const TERMINAL = theme(
  {
    background: "#0b0f0c",
    surface: "#121814",
    text: "#d8f5de",
    muted: "#9ab7a2",
    accent: "#6ee7a8",
    border: "#1f2b23",
  },
  "jetbrains-mono",
  "inter",
  "none",
);

const MAJLIS = theme(
  {
    background: "#fbf8f3",
    surface: "#ffffff",
    text: "#26211b",
    muted: "#5c5347",
    accent: "#1f6f5c",
    border: "#e6ded2",
  },
  "cairo",
  "cairo",
  "md",
);

const MIDNIGHT = theme(
  {
    background: "#0f1115",
    surface: "#171a21",
    text: "#eef1f6",
    muted: "#a9b3c1",
    accent: "#7cc4ff",
    border: "#2a303c",
  },
  "space-grotesk",
  "inter",
  "sm",
);

const SLATE = theme(
  {
    background: "#f4f7fb",
    surface: "#ffffff",
    text: "#1e293b",
    muted: "#4d5d75",
    accent: "#1d4ed8",
    border: "#d8e0ec",
  },
  "space-grotesk",
  "inter",
  "md",
);

const BOLD = theme(
  {
    background: "#2b0b3f",
    surface: "#3b1157",
    text: "#fdf4ff",
    muted: "#d9c2ef",
    accent: "#fbbf24",
    border: "#6b21a8",
  },
  "space-grotesk",
  "space-grotesk",
  "lg",
);

const EARTH = theme(
  {
    background: "#f6f1e7",
    surface: "#fffdf8",
    text: "#2f2a22",
    muted: "#5d5346",
    accent: "#8a5a2b",
    border: "#e2d7c3",
  },
  "lora",
  "inter",
  "md",
);

const NEON = theme(
  {
    background: "#0a0a0a",
    surface: "#141414",
    text: "#f5f5f5",
    muted: "#a3a3a3",
    accent: "#a3e635",
    border: "#2a2a2a",
  },
  "space-grotesk",
  "space-grotesk",
  "sm",
);

const PASTEL = theme(
  {
    background: "#fdf2f8",
    surface: "#ffffff",
    text: "#3a2f43",
    muted: "#6a5a72",
    accent: "#9d3f7d",
    border: "#f4d9e8",
  },
  "lora",
  "inter",
  "lg",
);

const MONO = theme(
  {
    background: "#ffffff",
    surface: "#f5f5f5",
    text: "#111111",
    muted: "#565656",
    accent: "#111111",
    border: "#d4d4d4",
  },
  "inter",
  "inter",
  "sm",
);

export const DEMO_PORTFOLIOS: readonly DemoPortfolio[] = [
  {
    id: demoId(1),
    publishedAt: "2026-11-10T09:15:00Z",
    profile: {
      username: "demo-sara-ahmed",
      displayName: "Sara Ahmed",
      headline: "Frontend engineer who cares about slow phones",
    },
    design: {
      version: 1,
      world: "editorial",
      theme: PAPER,
      sections: sectionsFor(
        ["hero", "projects", "about", "skills", "experience", "contact"],
        { hero: "large", projects: "grid", skills: "tags", experience: "timeline" },
      ),
    },
    content: {
      version: 1,
      about: {
        text: "I build interfaces that stay fast on a mid-range phone and readable with a screen reader. Most of my work is React and TypeScript, and most of my time goes on the parts nobody sees: focus order, empty states, and what happens when the network drops.",
      },
      projects: {
        items: [
          {
            id: itemId(1, 1, 1),
            title: "Course planner",
            description:
              "A timetable planner used by two departments. It works offline, keeps its state in the URL, and loads in under a second on a throttled connection.",
            link: "https://example.com/sara/course-planner",
          },
          {
            id: itemId(1, 1, 2),
            title: "Design system audit",
            description:
              "An accessibility pass over a forty-component library: every contrast pair measured, every focus state fixed, and a checklist the team still runs.",
            link: "https://example.com/sara/audit",
          },
        ],
      },
      skills: {
        skillIds: ["react", "typescript", "nextjs", "tailwind-css", "accessibility"],
      },
      experience: {
        items: [
          {
            id: itemId(1, 2, 1),
            kind: "experience",
            title: "Frontend engineer",
            organization: "Northline Studio",
            startDate: "2023-03",
            current: true,
            description:
              "Owns the component library and the performance budget for four client sites.",
          },
          {
            id: itemId(1, 2, 2),
            kind: "education",
            title: "BSc Computer Science",
            organization: "King Saud University",
            startDate: "2019-09",
            endDate: "2023-06",
          },
        ],
      },
      contact: {
        items: [
          {
            id: itemId(1, 3, 1),
            kind: "email",
            label: "Email",
            value: "sara@demo.folio.invalid",
          },
          {
            id: itemId(1, 3, 2),
            kind: "github",
            label: "GitHub",
            value: "https://github.com/demo-sara-ahmed",
          },
        ],
      },
    },
  },
  {
    id: demoId(2),
    publishedAt: "2026-11-09T14:40:00Z",
    profile: {
      username: "demo-mohammed-al-ahmad",
      displayName: "محمد الأحمد",
      headline: "مهندس برمجيات",
    },
    design: {
      version: 1,
      world: "terminal",
      theme: MAJLIS,
      sections: sectionsFor(["hero", "about", "skills", "projects", "experience", "contact"], {
        hero: "compact",
        projects: "timeline",
        skills: "list",
        experience: "list",
      }),
    },
    content: {
      version: 1,
      about: {
        text: "أعمل على أنظمة الويب من الخلف إلى الأمام، وأهتم بأن تبقى سريعة وبسيطة. أبني الخدمات بلغة بايثون وقاعدة بيانات بوستغرس، وأكتب الواجهات بـ React عندما يحتاج المشروع إلى واجهة تفاعلية.",
      },
      projects: {
        items: [
          {
            id: itemId(2, 1, 1),
            title: "منصة حجز المواعيد",
            description:
              "خدمة حجز تدير ثمانية فروع، مع لوحة متابعة يومية وتقارير شهرية تُصدَّر إلى ملف جدولي.",
            link: "https://example.com/mohammed/booking",
          },
        ],
      },
      skills: { skillIds: ["react", "python", "postgresql", "docker"] },
      experience: {
        items: [
          {
            id: itemId(2, 2, 1),
            kind: "experience",
            title: "مهندس برمجيات",
            organization: "شركة الرياض للتقنية",
            startDate: "2022-01",
            current: true,
            description: "مسؤول عن خدمة الحجوزات وواجهاتها البرمجية.",
          },
        ],
      },
      contact: {
        items: [
          {
            id: itemId(2, 3, 1),
            kind: "email",
            label: "البريد الإلكتروني",
            value: "mohammed@demo.folio.invalid",
          },
        ],
      },
    },
  },
  {
    id: demoId(3),
    publishedAt: "2026-11-08T11:05:00Z",
    profile: {
      username: "demo-lina-haddad",
      displayName: "لينا حداد",
      headline: "مصممة منتجات رقمية",
    },
    design: {
      version: 1,
      world: "editorial",
      theme: BOLD,
      sections: sectionsFor(["hero", "about", "projects", "skills", "experience", "contact"], {
        hero: "large",
        projects: "cards",
        skills: "tags",
        experience: "timeline",
      }),
    },
    content: {
      version: 1,
      about: {
        text: "I design products that people can finish a task in. I run the research myself, sketch the flow before the screens, and hand over components rather than pictures.",
      },
      projects: {
        items: [
          {
            id: itemId(3, 1, 1),
            title: "Onboarding rewrite",
            description:
              "Cut a nine-step signup to four and raised completion by a third. The change came from watching twelve sessions, not from a survey.",
            link: "https://example.com/lina/onboarding",
          },
        ],
      },
      skills: { skillIds: ["figma", "ui-design", "ux-research", "design-systems"] },
      experience: {
        items: [
          {
            id: itemId(3, 2, 1),
            kind: "experience",
            title: "Product designer",
            organization: "Majlis Labs",
            startDate: "2021-06",
            current: true,
          },
        ],
      },
      contact: {
        items: [
          {
            id: itemId(3, 3, 1),
            kind: "website",
            label: "Portfolio",
            value: "https://example.com/lina",
          },
        ],
      },
    },
  },
  {
    id: demoId(4),
    publishedAt: "2026-11-07T16:20:00Z",
    profile: {
      username: "demo-tom-baker",
      displayName: "Tom Baker",
      headline: "Backend developer, mostly databases",
    },
    design: {
      version: 1,
      world: "terminal",
      theme: MIDNIGHT,
      sections: sectionsFor(["hero", "skills", "projects", "experience", "about", "contact"], {
        hero: "compact",
        projects: "grid",
        skills: "tags",
        experience: "timeline",
      }),
    },
    content: {
      version: 1,
      about: {
        text: "I look after the parts of a service that keep working when everything else is on fire: migrations, indexes, and the queue nobody wants to own. I have spent more time reading query plans than writing screens.",
      },
      projects: {
        items: [
          {
            id: itemId(4, 1, 1),
            title: "Orders service split",
            description:
              "Split a monolith's ordering path into two services without downtime, using a dual write and a backfill that could be paused at any point.",
            link: "https://example.com/tom/orders",
          },
          {
            id: itemId(4, 1, 2),
            title: "Slow query hunt",
            description:
              "Cut the median response of the reporting endpoint from 2.4 seconds to 90 milliseconds by replacing a join with an index and a cache.",
          },
        ],
      },
      skills: { skillIds: ["nodejs", "postgresql", "graphql", "javascript"] },
      experience: {
        items: [
          {
            id: itemId(4, 2, 1),
            kind: "experience",
            title: "Backend developer",
            organization: "Harbour Freight",
            startDate: "2020-02",
            current: true,
          },
        ],
      },
      contact: {
        items: [
          {
            id: itemId(4, 3, 1),
            kind: "github",
            label: "GitHub",
            value: "https://github.com/demo-tom-baker",
          },
        ],
      },
    },
  },
  {
    id: demoId(5),
    publishedAt: "2026-11-06T08:30:00Z",
    profile: {
      username: "demo-priya-nair",
      displayName: "Priya Nair",
      headline: "Data analyst turning messy tables into answers",
    },
    design: {
      version: 1,
      world: "editorial",
      theme: SLATE,
      sections: sectionsFor(["hero", "about", "skills", "experience", "projects", "contact"], {
        hero: "compact",
        projects: "timeline",
        skills: "list",
        experience: "list",
      }),
    },
    content: {
      version: 1,
      about: {
        text: "I turn spreadsheets nobody trusts into numbers a team can act on. Most of my work is Python and SQL, and most of it is spent on definitions rather than charts.",
      },
      projects: {
        items: [
          {
            id: itemId(5, 1, 1),
            title: "Churn model",
            description:
              "A model that ranks accounts by risk of leaving, with the drivers written out in plain language so the success team can act on them.",
            link: "https://example.com/priya/churn",
          },
        ],
      },
      skills: { skillIds: ["python", "sql", "data-analysis", "machine-learning"] },
      experience: {
        items: [
          {
            id: itemId(5, 2, 1),
            kind: "experience",
            title: "Data analyst",
            organization: "Meridian Retail",
            startDate: "2022-08",
            current: true,
          },
          {
            id: itemId(5, 2, 2),
            kind: "education",
            title: "MSc Data Science",
            organization: "University of Leeds",
            startDate: "2020-09",
            endDate: "2022-06",
          },
        ],
      },
      contact: {
        items: [
          {
            id: itemId(5, 3, 1),
            kind: "linkedin",
            label: "LinkedIn",
            value: "https://example.com/in/priya-nair",
          },
        ],
      },
    },
  },
  {
    id: demoId(6),
    publishedAt: "2026-11-05T10:10:00Z",
    profile: {
      username: "demo-daniel-okafor",
      displayName: "Daniel Okafor",
      headline: "Mobile developer for iOS and Android",
    },
    design: {
      version: 1,
      world: "terminal",
      theme: NEON,
      sections: sectionsFor(["hero", "projects", "skills", "about", "experience", "contact"], {
        hero: "large",
        projects: "cards",
        skills: "list",
        experience: "timeline",
      }),
    },
    content: {
      version: 1,
      about: {
        text: "I ship apps that feel the same on both phones. Two of my apps are in daily use by field teams who work without a signal, so offline behaviour is the first thing I design.",
      },
      projects: {
        items: [
          {
            id: itemId(6, 1, 1),
            title: "Field survey app",
            description:
              "An offline-first survey tool used by forty field workers. Records sync when a connection returns, and conflicts are shown to the person who can settle them.",
            link: "https://example.com/daniel/field-survey",
          },
          {
            id: itemId(6, 1, 2),
            title: "Transit timetable",
            description:
              "A timetable that works from a cached copy and refreshes in the background, built once for both platforms.",
          },
        ],
      },
      skills: { skillIds: ["swift", "kotlin", "react", "typescript", "javascript"] },
      experience: {
        items: [
          {
            id: itemId(6, 2, 1),
            kind: "experience",
            title: "Mobile developer",
            organization: "Civic Transport",
            startDate: "2021-01",
            current: true,
          },
        ],
      },
      contact: {
        items: [
          {
            id: itemId(6, 3, 1),
            kind: "email",
            label: "Email",
            value: "daniel@demo.folio.invalid",
          },
        ],
      },
    },
  },
  {
    id: demoId(7),
    publishedAt: "2026-11-04T13:45:00Z",
    profile: {
      username: "demo-mei-chen",
      displayName: "Mei Chen",
      headline: "Full-stack developer, small teams only",
    },
    design: {
      version: 1,
      world: "editorial",
      theme: EARTH,
      sections: sectionsFor(["hero", "about", "projects", "skills", "experience", "contact"], {
        hero: "large",
        projects: "cards",
        skills: "tags",
        experience: "timeline",
      }),
    },
    content: {
      version: 1,
      about: {
        text: "I am the whole engineering team on most of my projects: the schema, the API, the interface and the deploy. That means I pick boring tools on purpose and write down why.",
      },
      projects: {
        items: [
          {
            id: itemId(7, 1, 1),
            title: "Booking platform",
            description:
              "A booking platform for a small tour operator: payments, reminders and a calendar the guides actually use. Built and maintained by one person.",
            link: "https://example.com/mei/booking",
          },
          {
            id: itemId(7, 1, 2),
            title: "Inventory sync",
            description:
              "A nightly sync between two inventory systems, with a report of everything it could not reconcile.",
          },
        ],
      },
      skills: {
        skillIds: ["react", "typescript", "nodejs", "postgresql", "docker", "python"],
      },
      experience: {
        items: [
          {
            id: itemId(7, 2, 1),
            kind: "experience",
            title: "Freelance developer",
            organization: "Self-employed",
            startDate: "2020-05",
            current: true,
            description: "Four long-running client projects, all still maintained.",
          },
        ],
      },
      contact: {
        items: [
          {
            id: itemId(7, 3, 1),
            kind: "website",
            label: "Website",
            value: "https://example.com/mei",
          },
          {
            id: itemId(7, 3, 2),
            kind: "github",
            label: "GitHub",
            value: "https://github.com/demo-mei-chen",
          },
        ],
      },
    },
  },
  {
    id: demoId(8),
    publishedAt: "2026-11-03T09:00:00Z",
    profile: {
      username: "demo-yusuf-karim",
      displayName: "Yusuf Karim",
      headline: "Platform engineer, on call most weeks",
    },
    design: {
      version: 1,
      world: "terminal",
      theme: TERMINAL,
      sections: sectionsFor(["hero", "skills", "experience", "about", "contact", "projects"], {
        hero: "compact",
        projects: "timeline",
        skills: "list",
        experience: "list",
      }),
    },
    content: {
      version: 1,
      about: {
        text: "I keep the cluster boring: predictable deploys, alerts that mean something, and a rollback that one person can run at three in the morning. I write the runbook before I write the automation.",
      },
      projects: {
        items: [
          {
            id: itemId(8, 1, 1),
            title: "Deploy pipeline rebuild",
            description:
              "Replaced a hand-run release process with a pipeline that builds, tests and deploys in eleven minutes, with a one-command rollback.",
            link: "https://example.com/yusuf/pipeline",
          },
        ],
      },
      skills: { skillIds: ["kubernetes", "docker", "aws", "linux"] },
      experience: {
        items: [
          {
            id: itemId(8, 2, 1),
            kind: "experience",
            title: "Platform engineer",
            organization: "Sable Systems",
            startDate: "2021-09",
            current: true,
          },
        ],
      },
      contact: {
        items: [
          {
            id: itemId(8, 3, 1),
            kind: "email",
            label: "Email",
            value: "yusuf@demo.folio.invalid",
          },
        ],
      },
    },
  },
  {
    id: demoId(9),
    publishedAt: "2026-11-02T15:25:00Z",
    profile: {
      username: "demo-elena-rossi",
      displayName: "Elena Rossi",
      headline: "UX researcher who writes things down",
    },
    design: {
      version: 1,
      world: "editorial",
      theme: PASTEL,
      sections: sectionsFor(["hero", "about", "projects", "experience", "skills", "contact"], {
        hero: "compact",
        projects: "timeline",
        skills: "tags",
        experience: "list",
      }),
    },
    content: {
      version: 1,
      about: {
        text: "I run small studies and write them up so the team can use them the same week. Most of my reports are one page long, and half of that page is what we decided not to build.",
      },
      projects: {
        items: [
          {
            id: itemId(9, 1, 1),
            title: "Checkout study",
            description:
              "Twelve sessions on a checkout flow. Three findings were fixed in a fortnight; the report is still the reference for the next round.",
            link: "https://example.com/elena/checkout",
          },
        ],
      },
      skills: { skillIds: ["ux-research", "accessibility", "figma", "technical-writing"] },
      experience: {
        items: [
          {
            id: itemId(9, 2, 1),
            kind: "experience",
            title: "UX researcher",
            organization: "Forma Studio",
            startDate: "2022-04",
            current: true,
          },
        ],
      },
      contact: {
        items: [
          {
            id: itemId(9, 3, 1),
            kind: "linkedin",
            label: "LinkedIn",
            value: "https://example.com/in/elena-rossi",
          },
        ],
      },
    },
  },
  {
    id: demoId(10),
    publishedAt: "2026-11-01T12:00:00Z",
    profile: {
      username: "demo-jonas-weber",
      displayName: "Jonas Weber",
      headline: "Software engineer working on long-lived systems",
    },
    design: {
      version: 1,
      world: "terminal",
      theme: MONO,
      sections: sectionsFor(["hero", "about", "skills", "projects", "experience", "contact"], {
        hero: "large",
        projects: "cards",
        skills: "list",
        experience: "timeline",
      }),
    },
    content: {
      version: 1,
      about: {
        text: "I work on systems that outlive the team that wrote them: clear modules, tests that explain themselves, and documentation a new colleague can follow on their first day.",
      },
      projects: {
        items: [
          {
            id: itemId(10, 1, 1),
            title: "Billing rewrite",
            description:
              "Moved billing off a stored-procedure layer onto a service with tests, one migration per table, and a read-only cutover week.",
            link: "https://example.com/jonas/billing",
          },
        ],
      },
      skills: { skillIds: ["java", "spring-boot", "postgresql", "react"] },
      experience: {
        items: [
          {
            id: itemId(10, 2, 1),
            kind: "experience",
            title: "Software engineer",
            organization: "Kestrel Insurance",
            startDate: "2019-10",
            current: true,
          },
        ],
      },
      contact: {
        items: [
          {
            id: itemId(10, 3, 1),
            kind: "email",
            label: "Email",
            value: "jonas@demo.folio.invalid",
          },
        ],
      },
    },
  },
];

export type DemoProblem = { who: string; field: string; message: string };

/**
 * Every way the demo data could be wrong, as a list rather than a throw.
 *
 * The generator throws on a non-empty list; the test asserts it is empty, so a bad
 * edit to the data above fails in CI rather than in the SQL editor.
 */
export function checkDemoPortfolios(
  portfolios: readonly DemoPortfolio[] = DEMO_PORTFOLIOS,
): DemoProblem[] {
  const problems: DemoProblem[] = [];
  const usernames = new Set<string>();

  for (const portfolio of portfolios) {
    const who = portfolio.profile.username;
    const profile = validateProfile(portfolio.profile);
    const design = validateDesign(portfolio.design);
    const content = validateContent(portfolio.content);

    for (const result of [profile, design, content]) {
      if (!result.success) {
        for (const error of result.errors) {
          problems.push({ who, field: error.path, message: error.message });
        }
      }
    }

    if (usernames.has(who)) {
      problems.push({ who, field: "username", message: "Duplicate demo username" });
    }
    usernames.add(who);

    if (!who.startsWith("demo-")) {
      problems.push({ who, field: "username", message: "Demo usernames must start with demo-" });
    }

    if (!portfolio.id.startsWith(DEMO_ID_PREFIX)) {
      problems.push({ who, field: "id", message: `Demo ids must start with ${DEMO_ID_PREFIX}` });
    }
  }

  const ids = new Set(portfolios.map((portfolio) => portfolio.id));

  if (ids.size !== portfolios.length) {
    problems.push({ who: "(all)", field: "id", message: "Duplicate demo id" });
  }

  return problems;
}

function assertValid(portfolios: readonly DemoPortfolio[]): void {
  const problems = checkDemoPortfolios(portfolios);

  if (problems.length > 0) {
    throw new Error(
      `The demo data does not pass the F-02 validators:\n${problems
        .map((problem) => `  ${problem.who} ${problem.field}: ${problem.message}`)
        .join("\n")}`,
    );
  }
}

/** A single-quoted SQL string. The only character that needs escaping is the quote. */
function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlJson(value: unknown): string {
  return `${sqlString(JSON.stringify(value))}::jsonb`;
}

const SEED_HEADER = `-- Folio F-09: ten published demo portfolios (D-093).
--
-- Generated by \`npm run seed:demo\` from \`src/search/demo-seed.ts\`. Do not edit
-- this file by hand: change the data, run the generator, and commit both.
--
-- Run in the Supabase SQL editor, after \`0003_search.sql\`. Safe to re-run: the
-- auth rows are inserted only when absent, and the published rows are upserted.
--
-- The users cannot log in: they have no password and no confirmed address. Their
-- addresses end in \`demo.folio.invalid\`, a domain that cannot receive mail.
`;

const REMOVE_HEADER = `-- Folio F-09: removes the demo portfolios (D-093).
--
-- Generated by \`npm run seed:demo\` from \`src/search/demo-seed.ts\`.
--
-- Deletes exactly the ten demo users and every row that hangs off them, in
-- dependency order. Real owners are untouched.
`;

/** The seed file, as SQL. Throws when the data does not pass the F-02 validators. */
export function buildDemoSeedSql(portfolios: readonly DemoPortfolio[] = DEMO_PORTFOLIOS): string {
  assertValid(portfolios);

  const users = portfolios
    .map((portfolio) =>
      [
        "  (",
        [
          sqlString(portfolio.id),
          sqlString("00000000-0000-0000-0000-000000000000"),
          sqlString("authenticated"),
          sqlString("authenticated"),
          sqlString(demoEmail(portfolio.profile.username)),
          sqlString(""),
          "now()",
          "now()",
          "now()",
          sqlJson({ provider: "email", providers: ["email"] }),
          sqlJson({
            username: portfolio.profile.username,
            display_name: portfolio.profile.displayName,
            headline: portfolio.profile.headline,
          }),
        ].join(", "),
        ")",
      ].join(""),
    )
    .join(",\n");

  const published = portfolios
    .map((portfolio) =>
      [
        "  (",
        [
          sqlString(portfolio.id),
          sqlString(portfolio.profile.username),
          sqlString(portfolio.profile.displayName),
          sqlString(portfolio.profile.headline),
          sqlJson(portfolio.design),
          sqlJson(portfolio.content),
          sqlString(portfolio.publishedAt),
          sqlString(portfolio.publishedAt),
        ].join(", "),
        ")",
      ].join(""),
    )
    .join(",\n");

  return `${SEED_HEADER}
begin;

-- The users. \`handle_new_user\` (0001) creates the profile row from the metadata
-- below, so the profile is never written by hand here.
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) values
${users}
on conflict (id) do nothing;

-- The published snapshots. \`published_at\` is written too, so the order results are
-- ranked in is stable from one run to the next.
insert into public.published_portfolios (
  user_id,
  username,
  display_name,
  headline,
  design,
  content,
  published_at,
  updated_at
) values
${published}
on conflict (user_id) do update set
  username = excluded.username,
  display_name = excluded.display_name,
  headline = excluded.headline,
  design = excluded.design,
  content = excluded.content,
  published_at = excluded.published_at,
  updated_at = excluded.updated_at;

commit;
`;
}

/** The removal file, as SQL. Throws when the data does not pass the validators. */
export function buildDemoRemovalSql(
  portfolios: readonly DemoPortfolio[] = DEMO_PORTFOLIOS,
): string {
  assertValid(portfolios);

  const ids = portfolios.map((portfolio) => `  ${sqlString(portfolio.id)}`).join(",\n");

  return `${REMOVE_HEADER}
begin;

delete from public.published_portfolios
where user_id in (
${ids}
);

delete from public.portfolios
where user_id in (
${ids}
);

delete from public.profiles
where id in (
${ids}
);

delete from auth.users
where id in (
${ids}
);

commit;
`;
}

/** The demo usernames, for the tests and the page's own checks. */
export const DEMO_USERNAMES: readonly string[] = DEMO_PORTFOLIOS.map(
  (portfolio) => portfolio.profile.username,
);
