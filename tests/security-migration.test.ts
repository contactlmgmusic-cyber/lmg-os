import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
test("security migration enforces quotas, invitation claims and rollback in PostgreSQL", async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      create schema private; create schema storage; create schema auth;
      create table auth.users(id uuid primary key);
      create table public.profiles(id uuid primary key references auth.users(id), email text, nom text check(nom <> 'FAIL'), role text);
      create table public.invitations(id uuid primary key, email text, role text, token_hash text, status text check(status in ('pending','accepted','expired')), expires_at timestamptz, accepted_at timestamptz);
      create table public.careers_applications(id uuid primary key);
      alter table public.careers_applications enable row level security;
      grant insert on public.careers_applications to anon,authenticated;
      create policy "Public can submit careers applications" on public.careers_applications for insert to anon,authenticated with check(true);
      create table storage.buckets(id text primary key, file_size_limit bigint);
      insert into storage.buckets values('careers-cv',10485760);
      create table storage.objects(id uuid primary key,bucket_id text);
      alter table storage.objects enable row level security;
      grant usage on schema storage to anon,authenticated;
      grant insert on storage.objects to anon,authenticated;
      create policy "careers public cv upload" on storage.objects for insert to anon,authenticated with check(bucket_id='careers-cv');
      create table public.careers_jobs(slug text,status text,short_description text);
      insert into public.careers_jobs values('assistant-e-de-communication','published','Offre test pour LMG Careers.');
    `);
    await db.exec(await readFile(new URL("../supabase/migrations/20261006000100_audit_security.sql",import.meta.url),"utf8"));
    await db.exec("set role anon");
    await assert.rejects(db.exec("insert into public.careers_applications values(gen_random_uuid())"));
    await assert.rejects(db.exec("insert into storage.objects values(gen_random_uuid(),'careers-cv')"));
    await assert.rejects(db.query("select public.consume_careers_submission_quota($1)",["a".repeat(64)]));
    await db.exec("reset role");
    for (let i=0;i<6;i++) {
      const result=await db.query<{ allowed:boolean }>("select public.consume_careers_submission_quota($1) as allowed",["a".repeat(64)]);
      assert.equal(result.rows[0].allowed,i<5);
    }
    for (let i=0;i<95;i++) {
      const result=await db.query<{allowed:boolean}>("select public.consume_careers_submission_quota($1) as allowed",[String(i).padStart(64,"0")]);
      assert.equal(result.rows[0].allowed,true);
    }
    assert.equal((await db.query<{allowed:boolean}>("select public.consume_careers_submission_quota($1) as allowed",["b".repeat(64)])).rows[0].allowed,false);
    const invite="11111111-1111-4111-8111-111111111111", account="22222222-2222-4222-8222-222222222222", claim="33333333-3333-4333-8333-333333333333";
    await db.query("insert into public.invitations(id,email,role,token_hash,status,expires_at) values($1,'test@example.com','manager','hash','pending',now()+interval '1 hour')",[invite]);
    const results=await Promise.all([db.query("select * from public.claim_lmg_invitation('hash',$1)",[claim]),db.query("select * from public.claim_lmg_invitation('hash',gen_random_uuid())")]);
    assert.equal(results.reduce((n,r)=>n+r.rows.length,0),1);
    await db.query("insert into auth.users values($1)",[account]);
    await assert.rejects(db.query("select public.complete_lmg_invitation($1,$2,$3,'FAIL')",[invite,claim,account]));
    const pending=await db.query<{status:string}>("select status from public.invitations where id=$1",[invite]);assert.equal(pending.rows[0].status,"pending");
    await db.query("select public.complete_lmg_invitation($1,$2,$3,'Test')",[invite,claim,account]);
    const accepted=await db.query<{status:string;token_hash:string|null}>("select status,token_hash from public.invitations where id=$1",[invite]);assert.equal(accepted.rows[0].status,"accepted");assert.equal(accepted.rows[0].token_hash,null);
    assert.equal((await db.query("select * from public.claim_lmg_invitation('hash',gen_random_uuid())")).rows.length,0);
    assert.equal((await db.query<{status:string}>("select status from public.careers_jobs")).rows[0].status,"draft");
  } finally { await db.close(); }
});
