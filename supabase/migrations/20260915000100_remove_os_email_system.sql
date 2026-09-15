begin;

-- Les e-mails présents dans LMG OS étaient uniquement des données de test.
-- La gestion des e-mails externes est désormais centralisée directement dans Gmail.
drop table if exists public.crm_email_replies cascade;
drop table if exists public.crm_scheduled_emails cascade;
drop table if exists public.crm_email_logs cascade;
drop table if exists public.crm_email_templates cascade;
drop table if exists public.google_gmail_connections cascade;

commit;
