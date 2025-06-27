import ChatInterface from '@/components/chat-interface';
import PublicHeader from '@/components/public-header';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-1 flex flex-col">
        <ChatInterface isPublic={true} />
      </main>
    </div>
  );
}
