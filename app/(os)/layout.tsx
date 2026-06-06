import AppShell from "@/components/AppShell";

export default function OSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}