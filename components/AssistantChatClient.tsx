"use client";

import { useEffect, useRef, useState } from "react";

type Source = { type: string; id: string; label: string };
type Message = { id?: string; role: "user" | "assistant"; content: string; sources?: Source[]; created_at?: string };
type Conversation = { id: string; title: string; updated_at: string };

const starters = [
  { label: "Progression LMG Global", prompt: "Fais-moi un compte rendu exécutif complet de la progression de LMG Global, séparé entre LMG Music, LMG Agency et projets internes : avancées, chiffres disponibles, retards, blocages, risques, décisions attendues et prochaines priorités." },
  { label: "Progression LMG Agency", prompt: "Analyse la progression de LMG Agency : prospects et demandes, pipeline par statut et priorité, besoins dominants, objectifs en cours, blocages et plan d’action recommandé." },
  { label: "Communiqué de presse", prompt: "Rédige un communiqué de presse professionnel pour la prochaine sortie de l’artiste que je vais te préciser. Utilise les données LMG disponibles et indique clairement ce qu’il reste à confirmer." },
  { label: "Stratégie de sortie", prompt: "Construis une stratégie de sortie complète et réaliste pour le prochain projet concerné, avec phases, contenus, responsabilités, calendrier et KPI." },
  { label: "Idées créatives", prompt: "Propose des idées de contenus et d’activations cohérentes avec l’univers de l’artiste concerné, classées par effort et potentiel." },
  { label: "Brief de réunion", prompt: "Prépare un brief de réunion LMG : situation actuelle, priorités, blocages, décisions attendues et prochaines actions." },
  { label: "Bio professionnelle", prompt: "Rédige une bio artiste professionnelle en version courte et longue à partir des informations LMG disponibles." },
  { label: "Pitch booking", prompt: "Rédige un pitch booking professionnel, crédible et personnalisable pour l’artiste concerné." },
];

export default function AssistantChatClient() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadConversations(selectedId?: string | null) {
    setLoading(true);
    setError("");
    try {
      const query = selectedId ? `?conversationId=${selectedId}` : "";
      const response = await fetch(`/api/assistant${query}`, { cache: "no-store" });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Impossible de charger l’assistant.");
      setConversations(data.conversations || []);
      if (selectedId) setMessages(data.messages || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Impossible de charger l’assistant.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadConversations(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, sending]);

  async function selectConversation(id: string) {
    setConversationId(id);
    setMessages([]);
    await loadConversations(id);
  }

  function newConversation(prompt = "") {
    setConversationId(null);
    setMessages([]);
    setInput(prompt);
    setError("");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = input.trim();
    if (!value || sending) return;
    setInput("");
    setSending(true);
    setError("");
    setMessages((current) => [...current, { role: "user", content: value }]);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value, conversationId }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Impossible de générer la réponse.");
      setConversationId(data.conversationId);
      setMessages((current) => [...current, data.message]);
      await loadConversations(data.conversationId);
    } catch (submitError) {
      setMessages((current) => current.filter((message, index) => !(index === current.length - 1 && message.role === "user" && message.content === value)));
      setInput(value);
      setError(submitError instanceof Error ? submitError.message : "Impossible de générer la réponse.");
    } finally {
      setSending(false);
    }
  }

  async function removeConversation(id: string) {
    if (!window.confirm("Supprimer définitivement cette conversation ?")) return;
    const response = await fetch(`/api/assistant?conversationId=${id}`, { method: "DELETE" });
    if (!response.ok) return;
    if (conversationId === id) newConversation();
    await loadConversations();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="grid min-h-screen lg:grid-cols-[290px_1fr]">
        <aside className="border-b border-zinc-800 bg-zinc-950 p-5 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between lg:block">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400">Intelligence LMG Global</p><h1 className="mt-2 text-xl font-bold">Assistant LMG</h1></div>
            <button type="button" onClick={() => newConversation()} className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black lg:mt-6 lg:w-full">+ Nouvelle conversation</button>
          </div>
          <div className="mt-6 hidden lg:block">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-600">Historique privé</p>
            <div className="space-y-2">
              {loading && conversations.length === 0 ? <p className="text-sm text-zinc-700">Chargement…</p> : conversations.length === 0 ? <p className="text-sm text-zinc-700">Aucune conversation.</p> : conversations.map((conversation) => (
                <div key={conversation.id} className={`group flex items-center rounded-xl border transition ${conversationId === conversation.id ? "border-cyan-500/40 bg-cyan-500/[0.08]" : "border-transparent hover:border-zinc-800 hover:bg-black"}`}>
                  <button type="button" onClick={() => selectConversation(conversation.id)} className="min-w-0 flex-1 px-3 py-3 text-left"><p className="truncate text-sm font-medium">{conversation.title}</p><p className="mt-1 text-[10px] text-zinc-700">{new Date(conversation.updated_at).toLocaleDateString("fr-FR")}</p></button>
                  <button type="button" onClick={() => removeConversation(conversation.id)} className="mr-2 rounded-lg px-2 py-1 text-xs text-zinc-700 opacity-0 hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100">×</button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex min-h-[calc(100vh-100px)] min-w-0 flex-col">
          <header className="border-b border-zinc-900 px-5 py-6 md:px-8">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-5">
              <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-yellow-500">Copilote LMG Global sécurisé</p><h2 className="mt-2 text-2xl font-bold md:text-3xl">Que doit-on analyser ou construire ?</h2></div>
              <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 sm:block">Accès Super Admin uniquement</span>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-7 md:px-8">
            <div className="mx-auto max-w-5xl">
              {messages.length === 0 ? (
                <div>
                  <div className="max-w-3xl"><h3 className="text-3xl font-bold tracking-tight md:text-5xl">Toute l’intelligence de LMG, au même endroit.</h3><p className="mt-4 max-w-2xl leading-7 text-zinc-500">LMG Music, LMG Agency, artistes, projets, équipes, CRM, finances et progression : demande un compte rendu, une analyse, une stratégie ou un document finalisé.</p></div>
                  <div className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{starters.map((starter) => <button key={starter.label} type="button" onClick={() => setInput(starter.prompt)} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-left transition hover:border-cyan-500/40 hover:bg-zinc-900"><p className="font-semibold">{starter.label}</p><p className="mt-2 line-clamp-2 text-sm text-zinc-600">{starter.prompt}</p></button>)}</div>
                  <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-sm leading-6 text-zinc-500"><span className="font-semibold text-zinc-300">Important :</span> l’assistant distingue les données confirmées des recommandations et signale les informations manquantes. Il ne crée, ne modifie et n’envoie rien sans validation humaine.</div>
                </div>
              ) : (
                <div className="space-y-7">{messages.map((message, index) => <ChatBubble key={message.id || `${message.role}-${index}`} message={message} />)}{sending && <div className="flex items-center gap-3 text-sm text-zinc-500"><span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />Analyse du contexte LMG et rédaction…</div>}<div ref={bottomRef} /></div>
              )}
              {error && <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}
            </div>
          </div>

          <form onSubmit={submit} className="border-t border-zinc-900 bg-black px-5 py-5 md:px-8">
            <div className="mx-auto max-w-5xl">
              <div className="flex items-end gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 focus-within:border-zinc-600">
                <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} rows={2} maxLength={6000} placeholder="Ex. Rédige un communiqué pour la prochaine sortie de Tayama…" className="max-h-48 min-h-14 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:text-zinc-700" />
                <button type="submit" disabled={sending || !input.trim()} className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-40">{sending ? "Analyse…" : "Envoyer"}</button>
              </div>
              <p className="mt-2 text-center text-[11px] text-zinc-700">Entrée pour envoyer · Maj + Entrée pour aller à la ligne · Les réponses importantes doivent être relues.</p>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }
  return <div className={isUser ? "ml-auto max-w-3xl" : "max-w-4xl"}>
    <div className={`rounded-2xl border p-5 md:p-6 ${isUser ? "border-white bg-white text-black" : "border-zinc-800 bg-zinc-950 text-zinc-200"}`}>
      <div className="mb-4 flex items-center justify-between gap-4"><p className={`text-xs font-bold uppercase tracking-wider ${isUser ? "text-zinc-500" : "text-cyan-400"}`}>{isUser ? "Toi" : "Assistant LMG"}</p><button type="button" onClick={copy} className={`text-xs ${isUser ? "text-zinc-500 hover:text-black" : "text-zinc-600 hover:text-white"}`}>{copied ? "Copié" : "Copier"}</button></div>
      <div className="text-sm leading-7 md:text-base">{isUser ? message.content : <AssistantMarkdown content={message.content} />}</div>
      {!isUser && message.sources && message.sources.length > 0 && <div className="mt-6 border-t border-zinc-800 pt-4"><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Contexte LMG consulté</p><div className="mt-3 flex flex-wrap gap-2">{message.sources.slice(0, 10).map((source) => <span key={`${source.type}-${source.id}`} className="rounded-full border border-zinc-800 bg-black px-3 py-1 text-xs text-zinc-500">{source.type} · {source.label}</span>)}</div></div>}
    </div>
  </div>;
}

function InlineMarkdown({ content }: { content: string }) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return <>{parts.map((part, index) => part.startsWith("**") && part.endsWith("**")
    ? <strong key={index} className="font-semibold text-white">{part.slice(2, -2)}</strong>
    : <span key={index}>{part}</span>)}</>;
}

function AssistantMarkdown({ content }: { content: string }) {
  return <div className="space-y-2.5">{content.split("\n").map((line, index) => {
    const value = line.trim();
    if (!value) return <div key={index} className="h-1" />;
    if (/^-{3,}$/.test(value)) return <hr key={index} className="my-5 border-zinc-800" />;
    const heading = value.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const size = heading[1].length === 1 ? "text-2xl" : heading[1].length === 2 ? "text-xl" : "text-lg";
      return <h3 key={index} className={`${size} mt-6 font-bold tracking-tight text-white`}><InlineMarkdown content={heading[2]} /></h3>;
    }
    const bullet = value.match(/^[-*]\s+(.+)$/);
    if (bullet) return <div key={index} className="flex gap-3 pl-1"><span className="mt-[1px] text-cyan-400">•</span><p className="min-w-0"><InlineMarkdown content={bullet[1]} /></p></div>;
    const numbered = value.match(/^(\d+)\.\s+(.+)$/);
    if (numbered) return <div key={index} className="flex gap-3 pl-1"><span className="font-semibold text-cyan-400">{numbered[1]}.</span><p className="min-w-0"><InlineMarkdown content={numbered[2]} /></p></div>;
    return <p key={index}><InlineMarkdown content={value} /></p>;
  })}</div>;
}
