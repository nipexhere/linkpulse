import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Linkpulse", template: "%s · Linkpulse" },
  description: "A link shortener with built-in click analytics, built with Next.js.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="border-b border-line">
          <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span aria-hidden className="grid size-6 place-items-center rounded-md bg-accent text-xs text-white">
                ↗
              </span>
              Linkpulse
            </Link>
            <Link href="/" className="text-sm text-muted hover:text-foreground">
              Shorten a link
            </Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
        <footer className="border-t border-line py-6 text-center text-xs text-muted">
          Built with Next.js by{" "}
          <a href="https://nipexfolio.vercel.app" className="underline hover:text-foreground">
            Adebayo Oseni
          </a>
          {" · "}
          <Link href="/admin" className="underline hover:text-foreground">
            Admin
          </Link>
        </footer>
      </body>
    </html>
  );
}
