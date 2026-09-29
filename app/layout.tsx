import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apocalypse Clock — Monitoring Machine Intelligence",
  description:
    "Real-world AI developments and an open scenario model: clock, news, history and sources.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
