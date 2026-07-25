"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { supabaseBrowser } from "@/lib/supabase-browser";
import type { Profile } from "@/types/profile";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabaseBrowser
      .from("profiles")
      .select(
        `
        id,
        email,
        full_name,
        nom,
        avatar_url,
        role,
        artiste_id,
        created_at
        `
      )
      .eq("id", currentUser.id)
      .maybeSingle();

    if (error) {
      console.error("Erreur lors du chargement du profil :", error);
      setProfile(null);
      return;
    }

    setProfile(data as Profile | null);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      const {
        data: { user: currentUser },
        error,
      } = await supabaseBrowser.auth.getUser();

      if (!mounted) return;

      if (error) {
        console.error(
          "Erreur lors du chargement de l’utilisateur :",
          error
        );
      }

      setUser(currentUser ?? null);
      await loadProfile(currentUser ?? null);

      if (mounted) {
        setLoading(false);
      }
    }

    void initializeAuth();

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;

        setUser(currentUser);
        await loadProfile(currentUser);

        if (mounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  return {
    user,
    profile,
    role: profile?.role ?? null,
    loading,
    isAuthenticated: Boolean(user),
  };
}