"use client";

import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../lib/supabase-browser";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await supabaseBrowser.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="w-full rounded-xl border border-zinc-800 px-4 py-3 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
    >
      Déconnexion
    </button>
  );
}