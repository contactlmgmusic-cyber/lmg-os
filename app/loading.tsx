export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />

        <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
          Legacy Music Group
        </p>

        <h1 className="mt-3 text-2xl font-bold">
          Chargement...
        </h1>
      </div>
    </div>
  );
}