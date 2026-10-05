import type { Metadata } from "next";
import "./globals.css";
import "./dystopia.css";

export const metadata: Metadata = {
  title: "Dystopia Clock — Green Argus AI Watch",
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
