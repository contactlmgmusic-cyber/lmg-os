export default function TachesPage() {
  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="rounded-3xl border-4 border-red-500 bg-red-600 p-10">
        <h1 className="text-5xl font-bold">
          TEST PAGE TACHES VERSION 2026
        </h1>

        <p className="mt-4 text-xl">
          Si tu vois ce bloc rouge :
        </p>

        <ul className="mt-4 list-disc space-y-2 pl-6 text-lg">
          <li>tu modifies bien le bon fichier</li>
          <li>Next recharge bien la page</li>
          <li>le problème vient d’ailleurs</li>
        </ul>
      </div>
    </main>
  );
}