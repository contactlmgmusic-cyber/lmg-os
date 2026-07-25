import type { UserRole } from "@/lib/auth/roles";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  nom: string | null;
  avatar_url: string | null;
  role: UserRole | "member";
  artiste_id: string | null;
  created_at: string;
}