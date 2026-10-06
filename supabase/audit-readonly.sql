-- Inspection uniquement ; aucune mutation. À exécuter dans l'environnement LMG OS autorisé.
select table_schema, table_name from information_schema.tables where table_schema in ('public','private') order by 1,2;
select schemaname, tablename, policyname, roles, cmd, qual, with_check from pg_policies where schemaname in ('public','storage') order by schemaname,tablename,policyname;
select n.nspname as schema_name, c.relname as table_name, c.relrowsecurity, c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where c.relkind='r' and n.nspname in ('public','storage') order by 1,2;
select table_name, grantee, privilege_type from information_schema.role_table_grants where table_schema='public' and grantee in ('anon','authenticated') order by 1,2,3;
select id, public, file_size_limit, allowed_mime_types from storage.buckets order by id;
select event_object_table, trigger_name, action_timing, event_manipulation from information_schema.triggers where trigger_schema='public' order by 1,2;
select conrelid::regclass as table_name, conname, pg_get_constraintdef(oid) as definition from pg_constraint where conrelid in ('public.invitations'::regclass,'public.profiles'::regclass,'public.careers_applications'::regclass);
-- Ne pas copier les lignes de profils, CV, jetons ou secrets dans des commentaires de PR.
