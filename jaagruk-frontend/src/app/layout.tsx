import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Jaagruk — See it. Report it. Fix it.",
    template: "%s | Jaagruk",
  },
  description:
    "AI-powered civic issue reporting platform. Report local issues with photos, and our multi-agent AI pipeline validates, classifies, routes to the right authority, and generates official complaints.",
  keywords: [
    "civic reporting",
    "pothole reporting",
    "municipal complaints",
    "smart city",
    "AI",
    "India",
  ],
  authors: [{ name: "Jaagruk" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
