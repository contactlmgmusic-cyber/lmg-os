import { SiteLanguageProvider } from "@/components/site/LanguageProvider";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteLanguageProvider>
      {children}
    </SiteLanguageProvider>
  );
}
