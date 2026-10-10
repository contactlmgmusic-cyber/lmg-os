"use client";

import { useRouter } from "next/navigation";

import { supabaseBrowser } from "@/lib/supabase-browser";

export default function MobileLogoutButton() {
  const router = useRouter();

  async function logout() {
    await supabaseBrowser.auth.signOut();
    router.replace("/login?next=/mobile");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="w-full rounded-[18px] border border-red-500/20 bg-red-500/[0.05] px-4 py-4 text-left text-sm font-black text-red-400"
    >
      Se déconnecter
    </button>
  );
}
