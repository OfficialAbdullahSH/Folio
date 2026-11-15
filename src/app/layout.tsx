import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/theme/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Folio",
  description: "Describe a portfolio, adjust the design, and publish it at your own link.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The head script sets `data-theme` on this element before hydration, so React
    // finds attributes it did not render. That is the point of the script, not a bug.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/*
        The theme is applied before the body is parsed (D-100). This has to be a
        blocking script in the head and not an effect: an effect runs after the first
        paint, which is the flash of the wrong palette this avoids. It only sets
        `data-theme` on `<html>`; the colors themselves live in globals.css.
      */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
