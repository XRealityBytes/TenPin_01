/**
 * Root layout for TenPin_01.
 *
 * Loads the JetBrains Mono font (matching Rowans Bowling site), registers it
 * as a CSS variable, and wraps all pages in the GameShell (header + nav +
 * footer). The viewport meta includes `viewport-fit=cover` so
 * env(safe-area-inset-*) values are populated on notched devices.
 */
import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";

import { GameShell } from "@/components/site/GameShell";

import "./globals.css";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "TenPin — Rowans Bowling Game",
    template: "%s | TenPin",
  },
  description:
    "Online tenpin bowling games and digital scorecard — part of Rowans Tenpin Bowl.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <GameShell>{children}</GameShell>
      </body>
    </html>
  );
}
