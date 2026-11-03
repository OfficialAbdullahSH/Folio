import {
  Cairo,
  Inter,
  JetBrains_Mono,
  Lora,
  Playfair_Display,
  Space_Grotesk,
} from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
});

const lora = Lora({ subsets: ["latin"], variable: "--font-lora", display: "swap" });

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const fontVariableClassName = [
  inter.variable,
  spaceGrotesk.variable,
  playfairDisplay.variable,
  lora.variable,
  jetbrainsMono.variable,
  cairo.variable,
].join(" ");
