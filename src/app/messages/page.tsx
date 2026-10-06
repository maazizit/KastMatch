"use client";

import { Suspense, useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { SiteNav } from "@/components/site-nav";
import {
  apiGetConversation,
  apiGetConversations,
  apiSendMessage,
  type ConversationSummary,
} from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { MESSAGE_MAX_LENGTH } from "@/lib/messaging-shared";

function timeLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  return d.toDateString() === today.toDateString()
    ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function Thread({ id, onBack }: { id: string; onBack: () => void }) {
  const [data, setData] = useState<Awaited<ReturnType<typeof apiGetConversation>> | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      setData(await apiGetConversation(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible");
    }
  }, [id]);

  useEffect(() => {
    const first = setTimeout(() => void load(), 0);
    const t = setInterval(() => {
      if (!document.hidden) void load();
    }, 5000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [load]);

  const count = data?.messages.length ?? 0;
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [count]);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    try {
      const msg = await apiSendMessage(id, body);
      setText("");
      setData((d) => (d ? { ...d, messages: [...d.messages, msg] } : d));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi échoué");
    } finally {
      setSending(false);
    }
  }

  if (!data) {
    return <p className="p-6 text-sm text-mist-dim">{error ?? "Chargement…"}</p>;
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-frame px-5 py-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Retour"
          className="grid size-9 place-items-center rounded-full border border-frame text-mist-dim hover:text-spot md:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <p className="font-display truncate text-lg text-mist">{data.conversation.other.name}</p>
          {data.conversation.castingHint && (
            <p className="truncate font-mono text-[11px] tracking-wider text-gold uppercase">
              {data.conversation.castingHint}
            </p>
          )}
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
        {data.messages.map((m) => {
          const mine = m.senderId === data.me;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                  mine ? "rounded-br-sm bg-spot text-white" : "rounded-bl-sm bg-lens text-mist",
                )}
              >
                {m.body}
                <p className={cn("mt-1 text-[10px]", mine ? "text-white/70" : "text-mist-dim")}>
                  {timeLabel(m.createdAt)}
                  {mine && m.readAt ? " · lu" : ""}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={onSend} className="border-t border-frame p-4">
        {error && <p className="mb-2 text-sm text-spot">{error}</p>}
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            rows={2}
            maxLength={MESSAGE_MAX_LENGTH}
            placeholder="Écris ton message… (Entrée pour envoyer)"
            className="min-w-0 flex-1 resize-none rounded-xl border border-frame bg-lens px-3 py-2.5 text-sm text-mist"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            aria-label="Envoyer"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-spot text-white transition hover:bg-[var(--spot-hover)] disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

function Inbox() {
  const router = useRouter();
  const params = useSearchParams();
  const active = params.get("c");
  const [list, setList] = useState<ConversationSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      apiGetConversations()
        .then((l) => !cancelled && setList(l))
        .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Chargement impossible"));
    void load();
    const t = setInterval(() => {
      if (!document.hidden) void load();
    }, 10000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [active]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 md:px-12">
      <p className="font-display text-sm tracking-[0.35em] text-spot uppercase">Messagerie</p>
      <h1 className="font-display mt-2 text-3xl tracking-tight text-mist md:text-4xl">Messages</h1>

      <div className="mt-8 grid h-[70vh] min-h-[460px] overflow-hidden rounded-2xl border border-frame bg-ink-elevated md:grid-cols-[320px_minmax(0,1fr)]">
        <aside className={cn("overflow-y-auto border-frame md:border-r", active && "hidden md:block")}>
          {error ? (
            <p className="p-5 text-sm text-spot">{error}</p>
          ) : !list ? (
            <p className="p-5 text-sm text-mist-dim">Chargement…</p>
          ) : list.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="mx-auto h-6 w-6 text-mist-dim" />
              <p className="mt-3 text-sm text-mist-dim">
                Aucune conversation. Les réalisateurs peuvent écrire aux talents depuis leur fiche.
              </p>
              <Link href="/director/talents" className="mt-3 inline-block text-sm font-semibold text-spot">
                Chercher des talents →
              </Link>
            </div>
          ) : (
            <ul>
              {list.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/messages?c=${c.id}`}
                    className={cn(
                      "block border-b border-frame px-5 py-4 transition hover:bg-lens",
                      active === c.id && "bg-spot/10",
                    )}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-display truncate text-mist">{c.other.name}</p>
                      <span className="shrink-0 text-[10px] text-mist-dim">{timeLabel(c.lastMessageAt)}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-mist-dim">
                        {c.lastMessage ? `${c.lastMessage.fromMe ? "Toi : " : ""}${c.lastMessage.body}` : "—"}
                      </p>
                      {c.unread > 0 && (
                        <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-spot px-1.5 text-[10px] font-bold text-white">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className={cn("min-h-0", !active && "hidden md:grid md:place-items-center")}>
          {active ? (
            <Thread key={active} id={active} onBack={() => router.push("/messages")} />
          ) : (
            <p className="p-6 text-sm text-mist-dim">Sélectionne une conversation.</p>
          )}
        </section>
      </div>
    </main>
  );
}

export default function MessagesPage() {
  return (
    <div className="cinema-stage min-h-[100svh]">
      <SiteNav />
      <AuthGate>
        <Suspense fallback={<p className="p-12 text-mist-dim">Chargement…</p>}>
          <Inbox />
        </Suspense>
      </AuthGate>
    </div>
  );
}
