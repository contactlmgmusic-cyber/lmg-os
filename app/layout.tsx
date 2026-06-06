import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Legacy Music Group",
  description: "Legacy Music Group",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}