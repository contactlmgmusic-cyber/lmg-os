create table if not exists public.google_drive_folder_bindings (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('artist', 'project')),
  entity_id uuid not null,
  folder_role text not null,
  google_drive_folder_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_type, entity_id, folder_role),
  unique (google_drive_folder_id)
);

comment on table public.google_drive_folder_bindings is
  'Correspondance serveur entre les entités LMG OS et leurs dossiers Google Drive.';

alter table public.google_drive_folder_bindings enable row level security;

revoke all on table public.google_drive_folder_bindings from anon, authenticated;

create index if not exists google_drive_folder_bindings_entity_idx
  on public.google_drive_folder_bindings (entity_type, entity_id);
