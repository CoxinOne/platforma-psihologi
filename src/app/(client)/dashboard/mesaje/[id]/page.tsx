import { notFound } from "next/navigation";
import { requireClient } from "@/lib/auth";
import { getConversation, getCounterpart, listMessages } from "@/lib/data/user";
import { ChatRoom } from "@/components/chat-room";

export default async function ClientConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireClient();

  const conversation = await getConversation(session.supabase, id);
  if (!conversation) notFound();

  const counterpart = await getCounterpart(session.supabase, conversation, session.user.id);
  if (!counterpart) notFound();

  const messages = await listMessages(session.supabase, id);

  return (
    <div className="space-y-4">
      <ChatRoom
        conversationId={conversation.id}
        currentUserId={session.user.id}
        counterpartName={counterpart.name}
        counterpartPhoto={counterpart.photoPath}
        counterpartId={counterpart.id}
        initialMessages={messages}
        backHref="/dashboard/mesaje"
        reportHref={`/dashboard/raportari?utilizator=${counterpart.id}&conversatie=${conversation.id}`}
        closed={Boolean(conversation.closed_at)}
      />
      <p className="rounded-xl border border-line bg-canvas px-4 py-3 text-xs text-muted">
        Mesajele nu sunt criptate end-to-end. Sunt protejate prin autentificare, RLS și conexiune
        cifrată TLS către baza de date. Nu partaja date medicale sensibile în chat.
      </p>
    </div>
  );
}
