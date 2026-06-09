export default function RejoindrePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-4xl px-6 py-24">
        <p className="mb-4 text-sm uppercase tracking-[0.4em] text-yellow-500">
          Rejoindre LMG
        </p>

        <h1 className="text-5xl font-black md:text-7xl">
          DEVENEZ UN ARTISTE LMG
        </h1>

        <p className="mt-8 text-xl text-zinc-400">
          Nous recherchons des artistes sérieux souhaitant développer leur
          carrière avec une vision long terme.
        </p>

        <form className="mt-16 space-y-6">
          <input
            type="text"
            placeholder="Nom d'artiste"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
          />

          <input
            type="text"
            placeholder="Ville"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
          />

          <input
            type="text"
            placeholder="Instagram"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
          />

          <input
            type="text"
            placeholder="TikTok"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
          />

          <input
            type="text"
            placeholder="Spotify"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
          />

          <input
            type="text"
            placeholder="Lien musique (YouTube, SoundCloud, Drive...)"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
          />

          <textarea
            rows={6}
            placeholder="Présente ton projet"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
          />

          <button
            type="submit"
            className="rounded-full bg-yellow-500 px-8 py-4 font-bold text-black"
          >
            Envoyer ma candidature
          </button>
        </form>
      </section>
    </main>
  );
}