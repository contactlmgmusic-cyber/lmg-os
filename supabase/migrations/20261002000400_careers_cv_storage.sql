insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'careers-cv',
  'careers-cv',
  false,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "careers public cv upload"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'careers-cv'
);

create policy "careers admins read cv"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'careers-cv'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'admin')
  )
);

create policy "careers admins delete cv"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'careers-cv'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'admin')
  )
);

grant select on table storage.objects to authenticated;
