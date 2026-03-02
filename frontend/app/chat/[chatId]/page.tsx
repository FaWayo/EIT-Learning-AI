import { ChatArea } from '@/components/chat/ChatArea';

interface Props {
  params: Promise<{ chatId: string }>;
}

export default async function ChatDetailPage({ params }: Props) {
  const { chatId } = await params;
  return <ChatArea chatId={chatId} />;
}
