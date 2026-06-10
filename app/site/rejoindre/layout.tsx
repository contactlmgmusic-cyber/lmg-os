import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rejoindre LMG | Legacy Music Group",
  description:
    "Candidatez pour rejoindre Legacy Music Group et présenter votre projet artistique.",
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}