import ChatInterface from '@/components/chat-interface';

export default function ChatPage() {
  return (
    <div className="flex h-[calc(100vh-theme(spacing.28))] flex-col">
       <div className="text-center mb-4">
        <h1 className="text-3xl font-bold">Reva</h1>
        <p className="text-muted-foreground">Tell me what you’d like to do…</p>
      </div>
      <ChatInterface />
    </div>
  );
}
