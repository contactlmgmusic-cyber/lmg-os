export default function CalendarDataWarning({ sources }: { sources: string[] }) {
  if (!sources.length) return null;
  return <p role="alert" className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">Certaines dates n’ont pas pu être chargées ({sources.join(", ")}). L’affichage est incomplet. Réessayez ou contactez un administrateur.</p>;
}
