import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import ChatWidget from "@/components/ChatWidget";
import { getSessionUser } from "@/lib/auth";
import { getCharacterStatus } from "@/lib/character-entitlements";
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
  const user = await getSessionUser();
  const characterStatus = user ? await getCharacterStatus(user.id) : null;
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <ChatWidget key={user?.id ?? "visitor"} authenticated={!!user} initialStatus={characterStatus} paymentsEnabled={process.env.CHARACTER_PAYMENTS_ENABLED === "true"} />
      </body>
    </html>
  );
}
