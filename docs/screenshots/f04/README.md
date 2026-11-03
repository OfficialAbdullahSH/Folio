# F-04 screenshots

Twenty-six full-page captures from the production build, taken in Chrome 155 at 1280×900 and 375×812 with the real fonts and images loaded. P-005b moved the earlier set here and added the two P-005 fixtures and the plain light stress theme.

## Fixture captures (14)

| File | Fixture | World | Theme | Width |
| --- | --- | --- | --- | --- |
| `demo-editorial-1280.png` | `demo-editorial` | editorial | the fixture's own theme | 1280 |
| `demo-editorial-375.png` | `demo-editorial` | editorial | the fixture's own theme | 375 |
| `demo-terminal-1280.png` | `demo-terminal` | terminal | the fixture's own theme | 1280 |
| `demo-terminal-375.png` | `demo-terminal` | terminal | the fixture's own theme | 375 |
| `demo-minimal-1280.png` | `demo-minimal` | editorial | the fixture's own theme | 1280 |
| `demo-minimal-375.png` | `demo-minimal` | editorial | the fixture's own theme | 375 |
| `demo-compact-1280.png` | `demo-compact` | terminal | the fixture's own theme | 1280 |
| `demo-compact-375.png` | `demo-compact` | terminal | the fixture's own theme | 375 |
| `demo-long-1280.png` | `demo-long` | terminal | the fixture's own theme | 1280 |
| `demo-long-375.png` | `demo-long` | terminal | the fixture's own theme | 375 |
| `demo-editorial-bold-1280.png` | `demo-editorial-bold` | editorial | the fixture's own theme | 1280 |
| `demo-editorial-bold-375.png` | `demo-editorial-bold` | editorial | the fixture's own theme | 375 |
| `demo-terminal-light-1280.png` | `demo-terminal-light` | terminal | the fixture's own theme | 1280 |
| `demo-terminal-light-375.png` | `demo-terminal-light` | terminal | the fixture's own theme | 375 |

## Stress-theme captures (12)

| File | Fixture | World | Theme | Width |
| --- | --- | --- | --- | --- |
| `demo-editorial-stress-light-1280.png` | `demo-editorial` | editorial | light | 1280 |
| `demo-editorial-stress-dark-1280.png` | `demo-editorial` | editorial | dark | 1280 |
| `demo-editorial-stress-saturated-1280.png` | `demo-editorial` | editorial | saturated | 1280 |
| `demo-editorial-stress-pastel-1280.png` | `demo-editorial` | editorial | pastel | 1280 |
| `demo-editorial-stress-warm-1280.png` | `demo-editorial` | editorial | warm | 1280 |
| `demo-editorial-stress-monochrome-1280.png` | `demo-editorial` | editorial | monochrome | 1280 |
| `demo-terminal-stress-light-1280.png` | `demo-terminal` | terminal | light | 1280 |
| `demo-terminal-stress-dark-1280.png` | `demo-terminal` | terminal | dark | 1280 |
| `demo-terminal-stress-saturated-1280.png` | `demo-terminal` | terminal | saturated | 1280 |
| `demo-terminal-stress-pastel-1280.png` | `demo-terminal` | terminal | pastel | 1280 |
| `demo-terminal-stress-warm-1280.png` | `demo-terminal` | terminal | warm | 1280 |
| `demo-terminal-stress-monochrome-1280.png` | `demo-terminal` | terminal | monochrome | 1280 |

## The six stress themes

These are the six palettes in `STRESS_THEMES` in `src/render/__tests__/worlds.test.tsx`. The cold navy theme from P-005 was replaced by the plain light theme in P-005b; the near-black dark theme stayed.

| Theme | Background | Surface | Text | Muted | Accent | Border | Radius | Fonts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| light | `#ffffff` | `#f4f6f8` | `#1a1a1a` | `#5b6470` | `#2563eb` | `#e2e8f0` | md | Inter / Inter |
| dark | `#000000` | `#0d0d0d` | `#ffffff` | `#c7c7c7` | `#ffd400` | `#3f3f3f` | none | JetBrains Mono / Inter |
| saturated | `#1e1b4b` | `#312e81` | `#eef2ff` | `#a5b4fc` | `#22d3ee` | `#4338ca` | md | Space Grotesk / Inter |
| pastel | `#fff7ed` | `#ffffff` | `#431407` | `#9a3412` | `#db2777` | `#fed7aa` | lg | Lora / Inter |
| warm | `#fdf6e3` | `#fffaf0` | `#3b2f2f` | `#8b5e3c` | `#b91c1c` | `#e7d8c9` | none | Lora / Inter |
| monochrome | `#f5f5f5` | `#ffffff` | `#111111` | `#555555` | `#111111` | `#d4d4d4` | sm | Playfair Display / Inter |

Stress captures override the nine theme variables on `[data-world]` in the browser, which is the same surface `ThemeScope` writes, so no markup or route changes are involved.

The same six palettes are rendered in the test suite (`AC-12 renders every style in both worlds under six stress themes` and `AC-12 uses the light, dark, saturated, pastel, warm and monochrome themes`), so a theme that breaks a section fails the build rather than only the screenshots.

At both widths every capture reported `document.documentElement.scrollWidth === clientWidth`. The mobile Terminal tab strip scrolls inside its own container.

At 1280 px, clicking each section link leaves the heading fully below the Terminal topbar: the sticky bar ends at 44 px and the nearest heading top is 114.5 px. In Editorial the masthead is not sticky; the nearest heading top is 60.5 px and every heading stays visible. The stylesheet scan test `AC-4 gives every anchor target a scroll-margin-top` enforces the offsets (3.75rem in Terminal, 1rem in Editorial).
