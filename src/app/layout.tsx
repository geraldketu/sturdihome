import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SeasonalExperience from "@/components/SeasonalExperience";
import { prisma } from "@/lib/prisma";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SturdiHome Network",
  description: "Connecting homeowners with trusted financing partners and home-service vendors.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  let themeSettings = null;
  try {
    themeSettings = await prisma.siteExperienceSettings.findUnique({ where: { id: "default" } });
  } catch {
    // The seasonal settings migration is additive; keep the existing site available before it is applied.
  }
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
          <SeasonalExperience initialSettings={themeSettings}>
          <SiteHeader />
          <div className="flex-1">{children}</div>
        </SeasonalExperience>
      </body>
    </html>
  );
}
