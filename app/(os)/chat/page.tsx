"use client";

import Link from "next/link";
import { FormEvent, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Profile = { id:string; nom:string|null; full_name:string|null; email?:string|null; role:string; artiste_id:string|null };
type Artist = { id:string; nom:string; manager_id:string|null };
type Member = { user_id:string; can_write:boolean; profiles:Profile|null };
type Channel = {
  id:string; name:string; slug:string; type:string|null; group_kind:"staff"|"artist"|"direction"|"custom"; description:string|null;
  write_mode:"all_members"|"selected_members"|"super_admin_only";
  allowed_roles:string[]; artiste_id:string|null; projet_id:string|null;
  is_archived:boolean; chat_channel_members:Member[];
};
type Message = { id:string; channel:string; user_id:string|null; message:string; created_at:string; profiles?:{nom:string|null;role:string|null}|null };
type Draft = {
  id:string|null; name:string; description:string; type:"staff"|"artist"|"direction"|"custom";
  artisteId:string; writeMode:Channel["write_mode"]; memberIds:string[]; writerIds:string[];
};

const DIRECTION = ["super_admin", "admin", "artistic_director"];
const STAFF = [...DIRECTION, "manager"];
const ROLE:Record<string,string> = { super_admin:"Super admin", admin:"Direction", artistic_director:"Direction artistique", manager:"Manager", artiste:"Artiste", prestataire:"Prestataire" };
const GROUP:Record<string,string> = { staff:"Staff LMG", artist:"Équipe artiste", direction:"Direction", custom:"Sur mesure" };
const EMPTY:Draft = { id:null, name:"", description:"", type:"staff", artisteId:"", writeMode:"all_members", memberIds:[], writerIds:[] };

function displayName(profile:Profile) { return profile.nom || profile.full_name || profile.email || "Membre LMG"; }
function dateLabel(value:string) {
  const date = new Date(value); const today = new Date();
  return date.toLocaleString("fr-FR", { ...(date.toDateString() === today.toDateString() ? {} : {day:"2-digit",month:"short"}), hour:"2-digit", minute:"2-digit" });
}
function ChatContent() {
  const pathname = usePathname(); const mobile = pathname.startsWith("/mobile/"); const params = useSearchParams();
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialChannelRef = useRef(params.get("channel"));
  const [profile,setProfile] = useState<Profile|null>(null); const [directory,setDirectory] = useState<Profile[]>([]); const [artists,setArtists] = useState<Artist[]>([]);
  const [channels,setChannels] = useState<Channel[]>([]); const [active,setActive] = useState(""); const [messages,setMessages] = useState<Message[]>([]);
  const [text,setText] = useState(""); const [search,setSearch] = useState(""); const [loading,setLoading] = useState(true); const [loadingMessages,setLoadingMessages] = useState(false);
  const [sending,setSending] = useState(false); const [saving,setSaving] = useState(false); const [modal,setModal] = useState(false); const [draft,setDraft] = useState<Draft>(EMPTY); const [error,setError] = useState("");

  const loadWorkspace = useCallback(async () => {
    setLoading(true); setError("");
    const {data:{user}} = await supabaseBrowser.auth.getUser();
    if (!user) { window.location.href="/login"; return; }
    const {data:me,error:meError} = await supabaseBrowser.from("profiles").select("id,nom,full_name,email,role,artiste_id").eq("id",user.id).single();
    if (meError || !me?.role) { setError("Impossible de vérifier votre accès aux discussions."); setLoading(false); return; }
    const current = me as Profile;
    if (current.role === "prestataire") { window.location.href = mobile ? "/mobile/messages/prives" : "/chat/prive"; return; }
    setProfile(current);
    const channelQuery = supabaseBrowser.from("chat_channels").select("id,name,slug,type,group_kind,description,write_mode,allowed_roles,artiste_id,projet_id,is_archived,chat_channel_members(user_id,can_write,profiles(id,nom,full_name,email,role,artiste_id))").eq("is_archived",false).order("created_at");
    const directoryQuery = current.role === "super_admin"
      ? fetch("/api/chat/groups", { cache: "no-store" }).then(async response => {
          const payload = await response.json();
          if (!response.ok) throw new Error(payload.error || "Annuaire indisponible.");
          return payload as { profiles: Profile[]; artists: Artist[] };
        })
      : Promise.resolve({ profiles: [] as Profile[], artists: [] as Artist[] });
    const [channelResult,directoryResult] = await Promise.all([channelQuery,directoryQuery]).catch(error => {
      setError(error instanceof Error ? error.message : "Impossible de charger les membres.");
      return [null, null] as const;
    });
    if (!channelResult || !directoryResult) { setLoading(false); return; }
    if (channelResult.error) { setError("Impossible de charger les groupes de discussion."); setLoading(false); return; }
    const list = (channelResult.data || []) as unknown as Channel[];
    let loadedProfiles = directoryResult.profiles;
    let loadedArtists = directoryResult.artists;
    if (current.role === "super_admin" && loadedProfiles.length === 0) {
      const [{ data: fallbackProfiles, error: fallbackProfileError }, { data: fallbackArtists, error: fallbackArtistError }] = await Promise.all([
        supabaseBrowser.from("profiles").select("id,nom,full_name,email,role,artiste_id").order("nom"),
        supabaseBrowser.from("artistes").select("id,nom,manager_id").order("nom"),
      ]);
      if (fallbackProfileError || fallbackArtistError) {
        setError(fallbackProfileError?.message || fallbackArtistError?.message || "Impossible de charger l’annuaire LMG.");
      }
      loadedProfiles = (fallbackProfiles || []) as Profile[];
      loadedArtists = (fallbackArtists || []) as Artist[];
    }
    setChannels(list); setDirectory(loadedProfiles); setArtists(loadedArtists);
    const requested=initialChannelRef.current; setActive(list.some(item=>item.slug===requested) ? requested || "" : list[0]?.slug || ""); setLoading(false);
  },[mobile]);

  const loadMessages = useCallback(async (channel:string) => {
    if (!channel) { setMessages([]); return; } setLoadingMessages(true);
    const {data,error:queryError}=await supabaseBrowser.from("chat_messages").select("id,channel,user_id,message,created_at,profiles(nom,role)").eq("channel",channel).order("created_at").limit(500);
    if (queryError) { setMessages([]); setError("Impossible de charger les messages de ce groupe."); } else setMessages((data||[]) as unknown as Message[]);
    setLoadingMessages(false);
  },[]);

  useEffect(()=>{ void loadWorkspace(); },[loadWorkspace]);
  useEffect(()=>{
    if (!active) { setMessages([]); return; } void loadMessages(active);
    const live=supabaseBrowser.channel(`chat-${active}`).on("postgres_changes",{event:"*",schema:"public",table:"chat_messages",filter:`channel=eq.${active}`},()=>void loadMessages(active)).subscribe();
    return ()=>{ void supabaseBrowser.removeChannel(live); };
  },[active,loadMessages]);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth",block:"end"}); },[messages.length]);

  const channel=channels.find(item=>item.slug===active); const membership=channel?.chat_channel_members.find(item=>item.user_id===profile?.id);
  const superAdmin=profile?.role==="super_admin";
  const canWrite=Boolean(superAdmin || (channel?.write_mode==="all_members"&&membership) || (channel?.write_mode==="selected_members"&&membership?.can_write));
  const filtered=useMemo(()=>{ const q=search.trim().toLowerCase(); return q ? messages.filter(item=>[item.message,item.profiles?.nom,item.profiles?.role].filter(Boolean).join(" ").toLowerCase().includes(q)) : messages; },[messages,search]);

  function selectChannel(slug:string) { setSearch(""); setActive(slug); window.history.replaceState(null,"",`${mobile?"/mobile/messages":"/chat"}?channel=${slug}`); }
  function automaticMembers(type:Draft["type"],artistId="") {
    if (type==="direction") return directory.filter(item=>DIRECTION.includes(item.role)).map(item=>item.id);
    if (type==="staff") return directory.filter(item=>STAFF.includes(item.role)).map(item=>item.id);
    if (type==="artist"&&artistId) { const artist=artists.find(item=>item.id===artistId); return directory.filter(item=>DIRECTION.includes(item.role)||item.artiste_id===artistId||item.id===artist?.manager_id).map(item=>item.id); }
    return profile?[profile.id]:[];
  }
  async function createGroup() {
    setError("");
    const response = await fetch(`/api/chat/groups?refresh=${Date.now()}`, { cache: "no-store" });
    const result = await response.json().catch(() => ({ error: "Réponse serveur invalide." }));
    if (!response.ok) { setError(result.error || "Impossible de charger l’annuaire LMG."); return; }
    const freshProfiles = (result.profiles || []) as Profile[];
    const freshArtists = (result.artists || []) as Artist[];
    if (freshProfiles.length === 0) {
      setError("L’annuaire Supabase ne contient aucun profil. Vérifiez la table profiles avant de créer un groupe.");
      return;
    }
    setDirectory(freshProfiles);
    setArtists(freshArtists);
    const ids = freshProfiles.filter(item => STAFF.includes(item.role)).map(item => item.id);
    setDraft({...EMPTY,memberIds:ids,writerIds:ids});
    setModal(true);
  }
  function editGroup(item:Channel) { const ids=item.chat_channel_members.map(member=>member.user_id); setDraft({id:item.id,name:item.name,description:item.description||"",type:item.group_kind||"custom",artisteId:item.artiste_id||"",writeMode:item.write_mode,memberIds:ids,writerIds:item.chat_channel_members.filter(member=>member.can_write).map(member=>member.user_id)}); setModal(true); }
  function changeType(type:Draft["type"]) { const artisteId=type==="artist"?draft.artisteId:""; const ids=automaticMembers(type,artisteId); setDraft(current=>({...current,type,artisteId,memberIds:ids,writerIds:ids})); }
  function changeArtist(artisteId:string) { const ids=automaticMembers("artist",artisteId); const nom=artists.find(item=>item.id===artisteId)?.nom; setDraft(current=>({...current,artisteId,name:current.name||(nom?`Équipe ${nom}`:""),memberIds:ids,writerIds:ids})); }
  function toggleMember(id:string) { setDraft(current=>{ const has=current.memberIds.includes(id); return {...current,memberIds:has?current.memberIds.filter(item=>item!==id):[...current.memberIds,id],writerIds:has?current.writerIds.filter(item=>item!==id):[...current.writerIds,id]}; }); }
  function toggleWriter(id:string) { setDraft(current=>({...current,writerIds:current.writerIds.includes(id)?current.writerIds.filter(item=>item!==id):[...current.writerIds,id]})); }

  async function saveGroup(event:FormEvent) {
    event.preventDefault(); if (!profile||!superAdmin||saving) return; const name=draft.name.trim();
    if (!name) { setError("Donnez un nom au groupe."); return; } if (draft.type==="artist"&&!draft.artisteId) { setError("Sélectionnez l’artiste concerné."); return; } if (!draft.memberIds.length) { setError("Ajoutez au moins un membre au groupe."); return; }
    setSaving(true); setError("");
    const payload={channelId:draft.id,name,description:draft.description.trim(),groupKind:draft.type,artisteId:draft.type==="artist"?draft.artisteId:null,writeMode:draft.writeMode,members:draft.memberIds.map(userId=>({userId,canWrite:draft.writeMode==="all_members"||(draft.writeMode==="selected_members"&&draft.writerIds.includes(userId))}))};
    const response=await fetch("/api/chat/groups",{method:draft.id?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const result=await response.json().catch(()=>({error:"Réponse serveur invalide."}));
    if(!response.ok){setError(result.error||"Le groupe n’a pas pu être enregistré.");setSaving(false);return;}
    setModal(false);setDraft(EMPTY);setSaving(false);await loadWorkspace();
  }
  async function sendMessage(event:FormEvent) { event.preventDefault(); const clean=text.trim(); if(!clean||!profile||!channel||!canWrite||sending)return; setSending(true);setError(""); const {error:sendError}=await supabaseBrowser.from("chat_messages").insert({channel:channel.slug,user_id:profile.id,message:clean}); if(sendError)setError("Le message n’a pas pu être envoyé.");else {setText("");await loadMessages(channel.slug);}setSending(false); }
  async function deleteMessage(id:string) { if(!window.confirm("Supprimer définitivement ce message ?"))return; const {error:deleteError}=await supabaseBrowser.from("chat_messages").delete().eq("id",id); if(deleteError)setError("Le message n’a pas pu être supprimé."); }

  if(loading)return <main className="min-h-screen bg-black p-6 text-white"><div className="mx-auto max-w-[1500px] rounded-[26px] border border-zinc-800 bg-zinc-950 p-8 text-zinc-500">Chargement des discussions...</div></main>;
  const manager=profile?.role==="manager", artist=profile?.role==="artiste";
  const title=manager?"Discussions de mes artistes":artist?"Mon équipe":"Discussions LMG";
  const subtitle=manager?"Les échanges avec vos artistes et la direction, réunis au bon endroit.":artist?"Votre espace direct avec votre manager et la direction LMG.":"Staff, direction et équipes artistes : chaque échange reste dans le bon cercle.";

  return <main className={mobile?"bg-black px-5 py-6 text-white":"min-h-screen bg-black px-4 py-6 text-white sm:px-6 xl:px-10 xl:py-8"}>
    <div className="mx-auto max-w-[1500px]">
      <header className={mobile?"mb-5":"mb-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"}>
        <div><p className="text-xs font-semibold uppercase tracking-[.32em] text-yellow-400">Communication · Groupes</p><h1 className={mobile?"mt-2 text-2xl font-black":"mt-3 text-3xl font-bold md:text-5xl"}>{title}</h1><p className="mt-2 text-sm text-zinc-400">{subtitle}</p></div>
        <nav className={mobile?"mt-4 flex gap-2 overflow-x-auto pb-1":"flex flex-wrap gap-2"}>
          {superAdmin&&<button onClick={createGroup} className="rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-black text-black hover:bg-yellow-300">+ Créer un groupe</button>}
          {!manager&&!artist&&<Link href={mobile?"/mobile/equipe":"/communication"} className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-zinc-300">Vue globale</Link>}
          <Link href={mobile?"/mobile/messages/prives":"/chat/prive"} className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black">Messages privés</Link>
        </nav>
      </header>
      {error&&<div className="mb-5 flex items-center justify-between rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"><p>{error}</p><button onClick={()=>setError("")} className="font-bold">×</button></div>}
      <div className={mobile?"grid min-w-0 gap-4":"grid min-h-[680px] gap-4 xl:h-[calc(100vh-220px)] xl:min-h-[620px] xl:grid-cols-[310px_1fr]"}>
        <aside className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
          <div className="flex items-center justify-between"><h2 className="font-bold">Mes groupes</h2><span className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs text-zinc-500">{channels.length}</span></div>
          {!channels.length?<p className="mt-5 rounded-2xl border border-dashed border-zinc-800 p-4 text-sm text-zinc-500">Aucun groupe accessible pour le moment.</p>:<div className={mobile?"mt-4 flex gap-2 overflow-x-auto [scrollbar-width:none]":"mt-4 flex gap-2 overflow-x-auto xl:block xl:space-y-2 xl:overflow-visible"}>{channels.map(item=><button key={item.id} onClick={()=>selectChannel(item.slug)} className={`${mobile?"min-w-[175px]":"min-w-fit xl:w-full"} rounded-2xl px-4 py-3 text-left ${active===item.slug?"bg-yellow-400 font-bold text-black":"border border-zinc-800 bg-black text-zinc-300 hover:border-zinc-600"}`}><span className="block truncate">{item.name}</span><span className={`mt-1 flex justify-between gap-2 text-xs ${active===item.slug?"text-black/60":"text-zinc-600"}`}><span>{GROUP[item.group_kind]||"Groupe"}</span><span>{item.chat_channel_members.length} membre{item.chat_channel_members.length!==1?"s":""}</span></span></button>)}</div>}
        </aside>
        <section className={`${mobile?"h-[min(650px,calc(100dvh-250px))] min-h-[500px]":"min-h-[560px]"} flex min-w-0 flex-col overflow-hidden rounded-[26px] border border-zinc-800 bg-zinc-950`}>
          <div className="flex flex-col gap-3 border-b border-zinc-800 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate font-bold">{channel?.name||"Aucun groupe"}</p>{channel&&!canWrite&&<span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-500">Lecture seule</span>}</div><p className="mt-1 truncate text-xs text-zinc-500">{channel?.description||`${channel?.chat_channel_members.length||0} membres · ${messages.length} messages`}</p></div>
            <div className="flex gap-2">{superAdmin&&channel&&<button onClick={()=>editGroup(channel)} className="rounded-xl border border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-300 hover:border-yellow-400 hover:text-yellow-400">Gérer le groupe</button>}{!mobile&&<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." className="max-w-60 rounded-xl border border-zinc-800 bg-black px-4 py-2 text-sm outline-none"/>}</div>
          </div>
          {channel&&<div className="flex gap-2 overflow-x-auto border-b border-zinc-900 px-4 py-2.5 [scrollbar-width:none]">{channel.chat_channel_members.map(member=><span key={member.user_id} className="shrink-0 rounded-full border border-zinc-800 bg-black px-2.5 py-1 text-[11px] text-zinc-400">{member.profiles?displayName(member.profiles):"Membre"}{channel.write_mode==="selected_members"&&!member.can_write?" · lecture":""}</span>)}</div>}
          <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
            {loadingMessages&&<p className="text-sm text-zinc-500">Chargement des messages...</p>}
            {!loadingMessages&&!filtered.length&&<div className="flex min-h-64 items-center justify-center text-center"><div><p className="font-semibold text-zinc-300">{search?"Aucun message ne correspond à la recherche.":"Cette discussion est encore vide."}</p>{!search&&canWrite&&<p className="mt-2 text-sm text-zinc-600">Lancez le premier échange avec le groupe.</p>}</div></div>}
            {filtered.map(item=>{const own=item.user_id===profile?.id;return <article key={item.id} className={`group flex ${own?"justify-end":"justify-start"}`}><div className={`max-w-[88%] rounded-2xl border p-4 sm:max-w-[75%] ${own?"border-yellow-400/25 bg-yellow-400/10":"border-zinc-800 bg-black"}`}><div className="flex flex-wrap gap-x-3"><p className="text-sm font-bold">{own?"Vous":item.profiles?.nom||"Membre LMG"}</p><p className="text-xs text-zinc-600">{ROLE[item.profiles?.role||""]||"Membre"} · {dateLabel(item.created_at)}</p></div><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-200">{item.message}</p>{(own||superAdmin)&&<button onClick={()=>void deleteMessage(item.id)} className="mt-2 text-xs font-semibold text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-red-300">Supprimer</button>}</div></article>})}<div ref={bottomRef}/>
          </div>
          <form onSubmit={sendMessage} className="border-t border-zinc-800 p-4 sm:p-5">{channel&&!canWrite?<div className="rounded-2xl border border-zinc-800 bg-black p-3 text-center text-sm text-zinc-500">Ce groupe est en lecture seule pour vous. Les droits d’écriture sont gérés par un super admin.</div>:<div className="flex items-end gap-2"><textarea value={text} onChange={e=>setText(e.target.value)} placeholder={channel?`Écrire dans ${channel.name}...`:"Sélectionnez un groupe"} disabled={!channel||sending} maxLength={2000} rows={mobile?1:2} className="min-w-0 flex-1 resize-none rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm outline-none focus:border-yellow-400/50"/><button disabled={!text.trim()||!channel||sending} className="rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black disabled:opacity-40">{sending?"Envoi...":"Envoyer"}</button></div>}</form>
        </section>
      </div>
    </div>

    {modal&&superAdmin&&<div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:p-5"><form onSubmit={saveGroup} className="max-h-[94dvh] w-full max-w-3xl overflow-y-auto rounded-t-[28px] border border-zinc-800 bg-zinc-950 p-5 sm:rounded-[28px] sm:p-7">
      <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.25em] text-yellow-400">Administration des discussions</p><h2 className="mt-2 text-2xl font-black">{draft.id?"Gérer le groupe":"Créer un groupe"}</h2></div><button type="button" onClick={()=>setModal(false)} className="h-10 w-10 rounded-full border border-zinc-800 text-xl text-zinc-400">×</button></div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold text-zinc-300">Nom du groupe<input value={draft.name} onChange={e=>setDraft(current=>({...current,name:e.target.value}))} maxLength={80} placeholder="Ex. Direction LMG" className="mt-2 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"/></label><label className="text-sm font-semibold text-zinc-300">Type de groupe<select value={draft.type} onChange={e=>changeType(e.target.value as Draft["type"])} className="mt-2 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white"><option value="staff">Staff uniquement</option><option value="artist">Artiste + manager + direction</option><option value="direction">Toute la direction</option><option value="custom">Sur mesure</option></select></label></div>
      {draft.type==="artist"&&<label className="mt-5 block text-sm font-semibold text-zinc-300">Artiste concerné<select value={draft.artisteId} onChange={e=>changeArtist(e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white"><option value="">Sélectionner un artiste</option>{artists.map(item=><option key={item.id} value={item.id}>{item.nom}</option>)}</select></label>}
      <label className="mt-5 block text-sm font-semibold text-zinc-300">Description<input value={draft.description} onChange={e=>setDraft(current=>({...current,description:e.target.value}))} maxLength={180} placeholder="Objet et usage de cette discussion" className="mt-2 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"/></label>
      <fieldset className="mt-6"><legend className="text-sm font-bold">Qui peut écrire ?</legend><div className="mt-3 grid gap-2 sm:grid-cols-3">{[["all_members","Tous les membres","Échange ouvert"],["selected_members","Membres choisis","Droits individuels"],["super_admin_only","Super admins","Annonce en lecture seule"]].map(([value,title,detail])=><label key={value} className={`cursor-pointer rounded-2xl border p-3 ${draft.writeMode===value?"border-yellow-400 bg-yellow-400/10":"border-zinc-800 bg-black"}`}><input type="radio" className="sr-only" checked={draft.writeMode===value} onChange={()=>setDraft(current=>({...current,writeMode:value as Draft["writeMode"]}))}/><span className="block text-sm font-bold">{title}</span><span className="mt-1 block text-xs text-zinc-500">{detail}</span></label>)}</div></fieldset>
      <div className="mt-6"><div className="flex justify-between"><h3 className="text-sm font-bold">Membres du groupe</h3><span className="text-xs text-zinc-500">{draft.memberIds.length} sélectionné{draft.memberIds.length!==1?"s":""}</span></div><div className="mt-3 max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-zinc-800 bg-black p-2">{directory.map(item=>{const selected=draft.memberIds.includes(item.id),writer=draft.writerIds.includes(item.id);return <div key={item.id} className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${selected?"border-zinc-700 bg-zinc-900":"border-transparent"}`}><label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"><input type="checkbox" checked={selected} onChange={()=>toggleMember(item.id)} className="h-4 w-4 accent-yellow-400"/><span className="min-w-0"><span className="block truncate text-sm font-semibold">{displayName(item)}</span><span className="block text-xs text-zinc-500">{ROLE[item.role]||item.role}</span></span></label>{selected&&draft.writeMode==="selected_members"&&item.role!=="super_admin"&&<button type="button" onClick={()=>toggleWriter(item.id)} className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${writer?"bg-yellow-400 text-black":"border border-zinc-700 text-zinc-500"}`}>{writer?"Peut écrire":"Lecture seule"}</button>}</div>})}</div></div>
      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={()=>setModal(false)} className="rounded-xl border border-zinc-700 px-5 py-3 font-bold text-zinc-300">Annuler</button><button disabled={saving} className="rounded-xl bg-yellow-400 px-6 py-3 font-black text-black disabled:opacity-50">{saving?"Enregistrement...":draft.id?"Enregistrer les changements":"Créer le groupe"}</button></div>
    </form></div>}
  </main>;
}

export default function ChatPage(){return <Suspense fallback={<main className="min-h-screen bg-black p-6 text-white">Chargement des discussions...</main>}><ChatContent/></Suspense>;}
