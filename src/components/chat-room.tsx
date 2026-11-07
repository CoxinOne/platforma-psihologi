"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Flag, Send } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/public-env";
import { humanizeError } from "@/lib/errors";
import { formatTime, localDateKey } from "@/lib/time";
import { notifyMessageEmailAction } from "@/lib/actions/messaging";
import { Avatar, Alert, buttonClasses } from "@/components/ui";
import type { Message } from "@/lib/types";

export function ChatRoom({
  conversationId,
  currentUserId,
  counterpartName,
  counterpartPhoto,
  counterpartId,
  initialMessages,
  backHref,
  reportHref,
  closed,
}: {
  conversationId: string;
  currentUserId: string;
  counterpartName: string;
  counterpartPhoto: string | null;
  counterpartId: string;
  initialMessages: Message[];
  backHref: string;
  reportHref: string;
  closed: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connection, setConnection] = useState<"connecting" | "online" | "offline">("connecting");
  const bottomRef = useRef<HTMLDivElement>(null);

  const appendMessage = (message: Message) => {
    setMessages((previous) =>
      previous.some((item) => item.id === message.id) ? previous : [...previous, message],
    );
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setConnection("offline");
      return;
    }
    const supabase = createSupabaseBrowserClient();
    void supabase.rpc("mark_conversation_read", { p_conversation: conversationId });

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const message = payload.new as Message;
          appendMessage(message);
          if (message.sender_id !== currentUserId) {
            void supabase.rpc("mark_conversation_read", { p_conversation: conversationId });
          }
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setConnection("online");
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          setConnection("offline");
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const handleSend = async () => {
    const text = body.trim();
    if (!text || sending || closed) return;
    if (text.length > 4000) {
      setError("Mesajul poate avea cel mult 4000 de caractere.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: rpcError } = await supabase.rpc("send_message", {
        p_conversation: conversationId,
        p_body: text,
      });

      if (rpcError) {
        setError(humanizeError(rpcError));
        return;
      }

      setBody("");
      const { data: row } = await supabase
        .from("messages")
        .select("id, conversation_id, sender_id, body, created_at")
        .eq("id", data as string)
        .maybeSingle();

      if (row) appendMessage(row as Message);
      void notifyMessageEmailAction(conversationId).catch(() => {});
    } catch {
      setError("Mesajul nu a putut fi trimis. Verifică conexiunea și încearcă din nou.");
    } finally {
      setSending(false);
    }
  };

  let lastDay = "";

  return (
    <div className="flex min-h-[60vh] flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={backHref}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-brand hover:bg-brand-soft"
            aria-label="Înapoi la conversații"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Avatar name={counterpartName} photoPath={counterpartPhoto} size={40} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{counterpartName}</p>
            <p className="text-xs text-muted" aria-live="polite">
              {connection === "online"
                ? "Conectat în timp real"
                : connection === "offline"
                  ? "Fără actualizări în timp real"
                  : "Se conectează…"}
            </p>
          </div>
        </div>
        <Link
          href={reportHref}
          className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:border-danger hover:text-danger"
        >
          <Flag className="h-3.5 w-3.5" aria-hidden="true" />
          Raportează
        </Link>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto bg-canvas/40 px-4 py-5" aria-live="polite">
        {messages.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-semibold text-ink">Începe conversația</p>
            <p className="mt-1 text-sm text-muted">
              Mesajele sunt private și pot fi citite doar de tine și {counterpartName}.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const day = localDateKey(message.created_at);
            const showDay = day !== lastDay;
            lastDay = day;
            const own = message.sender_id === currentUserId;

            return (
              <div key={message.id}>
                {showDay ? (
                  <p className="my-4 text-center text-xs font-medium uppercase tracking-wide text-muted">
                    {new Intl.DateTimeFormat("ro-RO", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      timeZone: "Europe/Bucharest",
                    }).format(new Date(message.created_at))}
                  </p>
                ) : null}
                <div className={own ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      own
                        ? "max-w-[85%] rounded-2xl rounded-br-md bg-brand px-3.5 py-2.5 text-sm text-cream"
                        : "max-w-[85%] rounded-2xl rounded-bl-md border border-line bg-surface px-3.5 py-2.5 text-sm text-ink"
                    }
                  >
                    <p className="whitespace-pre-wrap break-words">{message.body}</p>
                    <p className={own ? "mt-1 text-right text-[0.65rem] text-cream/60" : "mt-1 text-right text-[0.65rem] text-muted"}>
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-line bg-surface p-3 sm:p-4">
        {error ? <Alert tone="danger" className="mb-3">{error}</Alert> : null}
        {closed ? (
          <Alert tone="info">Conversația este închisă și nu mai poate primi mesaje.</Alert>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleSend();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1">
              <label htmlFor="chat-message" className="sr-only">
                Mesaj către {counterpartName}
              </label>
              <textarea
                id="chat-message"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
                rows={2}
                maxLength={4000}
                placeholder="Scrie un mesaj… (Enter trimite, Shift+Enter linie nouă)"
                className="w-full resize-none rounded-2xl border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
              />
              <p className="mt-1 text-right text-[0.65rem] text-muted">{body.length}/4000</p>
            </div>
            <button
              type="submit"
              disabled={sending || body.trim().length === 0}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-cream hover:bg-brand-strong disabled:opacity-50"
              aria-label="Trimite mesajul"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        )}
        <p className="mt-2 text-[0.7rem] text-muted">
          Nu trimite date medicale sensibile în chat. Pentru urgențe, apelează 112.
        </p>
        <Link href={backHref} className={buttonClasses("ghost", "sm", "mt-2")}>
          Toate conversațiile
        </Link>
      </div>
    </div>
  );
}
