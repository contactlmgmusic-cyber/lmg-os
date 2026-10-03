import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Present Your Project | LMG Music",
  description:
    "Present your music and artistic project to the LMG Music team.",
  alternates: {
    canonical: "/rejoindre",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
