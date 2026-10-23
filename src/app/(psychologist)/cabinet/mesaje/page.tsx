import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { requirePsychologist } from "@/lib/auth";
import { listConversations } from "@/lib/data/user";
import { formatDateTime } from "@/lib/time";
import { Avatar, buttonClasses, EmptyState, PageHeader } from "@/components/ui";

export default async function PsychologistMessagesPage() {
  const session = await requirePsychologist();
  const conversations = await listConversations(session.supabase);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mesagerie"
        title="Conversațiile mele"
        description="Conversațiile care îți aparțin. Nu ai acces la mesajele altor psihologi."
        action={
          <Link href="/cabinet/programari" className={buttonClasses("secondary")}>
            Vezi programările
          </Link>
        }
      />

      {conversations.length > 0 ? (
        <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <Link
                href={`/cabinet/mesaje/${conversation.id}`}
                className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-brand-soft/40"
              >
                <Avatar name={conversation.counterpart_name} photoPath={conversation.counterpart_photo} size={44} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-semibold text-ink">{conversation.counterpart_name}</span>
                    <span className="shrink-0 text-xs text-muted">{formatDateTime(conversation.last_message_at)}</span>
                  </span>
                  <span className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="truncate text-sm text-muted">
                      {conversation.last_message_preview ?? "Conversație nouă"}
                    </span>
                    {conversation.unread_count > 0 ? (
                      <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[0.65rem] font-bold text-white">
                        {conversation.unread_count}
                      </span>
                    ) : null}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<MessageCircle className="h-6 w-6" />}
          title="Nu ai conversații"
          description="Clienții pot începe o conversație din profilul tău public, după aprobare."
          action={
            <Link href="/cabinet/profil" className={buttonClasses("secondary")}>
              Verifică profilul
            </Link>
          }
        />
      )}
    </div>
  );
}
