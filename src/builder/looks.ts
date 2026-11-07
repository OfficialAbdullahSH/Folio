import type { DesignTheme } from "@/schema";

export type Look = {
  id: string;
  name: string;
  description: string;
  theme: DesignTheme;
};

/**
 * A look sets the six colors, both fonts and the radius together (D-075).
 *
 * Every look must pass the F-02 validator and produce no readability warning;
 * `looks.test.ts` holds that, so a new look cannot arrive unreadable.
 */
export const LOOKS: readonly Look[] = [
  {
    id: "paper",
    name: "Paper",
    description: "Warm off-white, a serif heading and quiet brown links.",
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
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep blue-black with a cool, bright accent.",
    theme: {
      colors: {
        background: "#0f1115",
        surface: "#171a21",
        text: "#eef1f6",
        muted: "#a9b3c1",
        accent: "#7cc4ff",
        border: "#2a303c",
      },
      headingFont: "space-grotesk",
      bodyFont: "inter",
      radius: "sm",
    },
  },
  {
    id: "terminal",
    name: "Terminal",
    description: "Phosphor green on near-black, all monospace.",
    theme: {
      colors: {
        background: "#0b0f0c",
        surface: "#121814",
        text: "#d8f5de",
        muted: "#9ab7a2",
        accent: "#6ee7a8",
        border: "#1f2b23",
      },
      headingFont: "jetbrains-mono",
      bodyFont: "inter",
      radius: "none",
    },
  },
  {
    id: "bold",
    name: "Bold",
    description: "Saturated purple with a gold accent.",
    theme: {
      colors: {
        background: "#2b0b3f",
        surface: "#3b1157",
        text: "#fdf4ff",
        muted: "#d9c2ef",
        accent: "#fbbf24",
        border: "#6b21a8",
      },
      headingFont: "space-grotesk",
      bodyFont: "space-grotesk",
      radius: "lg",
    },
  },
  {
    id: "pastel",
    name: "Pastel",
    description: "Soft pink and white with a deep rose accent.",
    theme: {
      colors: {
        background: "#fdf2f8",
        surface: "#ffffff",
        text: "#3a2f43",
        muted: "#6a5a72",
        accent: "#9d3f7d",
        border: "#f4d9e8",
      },
      headingFont: "lora",
      bodyFont: "inter",
      radius: "lg",
    },
  },
  {
    id: "earth",
    name: "Earth",
    description: "Warm sand, dark ink and a clay accent.",
    theme: {
      colors: {
        background: "#f6f1e7",
        surface: "#fffdf8",
        text: "#2f2a22",
        muted: "#5d5346",
        accent: "#8a5a2b",
        border: "#e2d7c3",
      },
      headingFont: "lora",
      bodyFont: "inter",
      radius: "md",
    },
  },
  {
    id: "mono",
    name: "Mono",
    description: "Pure greys, no color at all, tight corners.",
    theme: {
      colors: {
        background: "#ffffff",
        surface: "#f5f5f5",
        text: "#111111",
        muted: "#565656",
        accent: "#111111",
        border: "#d4d4d4",
      },
      headingFont: "inter",
      bodyFont: "inter",
      radius: "sm",
    },
  },
  {
    id: "majlis",
    name: "Majlis",
    description: "Cairo throughout, for Arabic and Latin together.",
    theme: {
      colors: {
        background: "#fbf8f3",
        surface: "#ffffff",
        text: "#26211b",
        muted: "#5c5347",
        accent: "#1f6f5c",
        border: "#e6ded2",
      },
      headingFont: "cairo",
      bodyFont: "cairo",
      radius: "md",
    },
  },
  {
    id: "slate",
    name: "Slate",
    description: "Cool paper, blue-grey text, a confident blue link.",
    theme: {
      colors: {
        background: "#f4f7fb",
        surface: "#ffffff",
        text: "#1e293b",
        muted: "#4d5d75",
        accent: "#1d4ed8",
        border: "#d8e0ec",
      },
      headingFont: "space-grotesk",
      bodyFont: "inter",
      radius: "md",
    },
  },
  {
    id: "neon",
    name: "Neon",
    description: "Black, white and an electric lime accent.",
    theme: {
      colors: {
        background: "#0a0a0a",
        surface: "#141414",
        text: "#f5f5f5",
        muted: "#a3a3a3",
        accent: "#a3e635",
        border: "#2a2a2a",
      },
      headingFont: "space-grotesk",
      bodyFont: "space-grotesk",
      radius: "sm",
    },
  },
];

export function lookById(id: string): Look | undefined {
  return LOOKS.find((look) => look.id === id);
}

/** The look whose theme is exactly the one in hand, or null once it has been edited. */
export function lookIdFor(theme: DesignTheme): string | null {
  const match = LOOKS.find(
    (look) =>
      look.theme.headingFont === theme.headingFont &&
      look.theme.bodyFont === theme.bodyFont &&
      look.theme.radius === theme.radius &&
      look.theme.colors.background === theme.colors.background &&
      look.theme.colors.surface === theme.colors.surface &&
      look.theme.colors.text === theme.colors.text &&
      look.theme.colors.muted === theme.colors.muted &&
      look.theme.colors.accent === theme.colors.accent &&
      look.theme.colors.border === theme.colors.border,
  );

  return match?.id ?? null;
}
