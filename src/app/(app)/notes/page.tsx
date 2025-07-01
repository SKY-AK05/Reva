'use client';

import { useState } from 'react';
import { StickyNote, Bot, Sparkles, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getComposedNote } from './actions';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Types
type Note = {
  id: string;
  title: string;
  rawContent: string;
  composedContent: string | null;
};

// Initial Data
const initialNotes: Note[] = [
  {
    id: '1',
    title: 'Getting Started',
    rawContent: 'This is a sample note to get you started. You can write anything here - meeting notes, random thoughts, a project plan, or even a journal entry. When you\'re ready, click the "Organize with AI" button to see the magic happen!',
    composedContent: `### Getting Started with Smart Notes

Welcome to your new intelligent note-taking space! Here's how to make the most of it:

1.  **Write Freely:** Capture your thoughts, meeting notes, or brilliant ideas in this editor. Don't worry about formatting.
2.  **Let AI Organize:** Click the **"Organize with AI"** button.
3.  **See the Magic:** Your note will be transformed into a structured, easy-to-read format on the right.

Happy writing!`,
  },
  {
    id: '2',
    title: 'Project Phoenix Plan',
    rawContent: 'Okay, big meeting today about Project Phoenix. We need to finalize the roadmap. John thinks we should focus on the new dashboard first. Maria wants to prioritize the mobile app. I think we need to do both, but we have to start with the backend refactor. I need to remember to schedule a follow-up with the design team about the new mockups and also draft the Q3 goals for the leadership review. The deadline for the prototype is end of next month.',
    composedContent: `### Project Phoenix Roadmap Discussion

**Key Priorities:**
- **John's View:** Focus on the new dashboard first.
- **Maria's View:** Prioritize the mobile app.
- **My Conclusion:** A backend refactor is the essential first step before tackling both the dashboard and mobile app.

**Action Items:**
- [ ] Schedule follow-up with the design team about new mockups.
- [ ] Draft Q3 goals for leadership review.

**🗓️ Deadline:** The prototype must be completed by the end of next month.`,
  },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [activeNoteId, setActiveNoteId] = useState<string | null>('1');
  const [isLoading, setIsLoading] = useState(false);

  const activeNote = notes.find(note => note.id === activeNoteId);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!activeNoteId) return;
    setNotes(notes.map(note =>
      note.id === activeNoteId ? { ...note, rawContent: e.target.value } : note
    ));
  };

  const handleCompose = async () => {
    if (!activeNote || !activeNote.rawContent.trim()) return;
    setIsLoading(true);
    try {
      const result = await getComposedNote(activeNote.rawContent);
      setNotes(notes.map(note =>
        note.id === activeNoteId ? { ...note, composedContent: result.composedContent, title: result.title } : note
      ));
    } catch (error) {
      console.error("Failed to compose note:", error);
      // Here you could use a toast to show an error to the user
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      rawContent: "",
      composedContent: null,
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };


  return (
    <div className="flex flex-1 flex-col h-full">
      <header className="flex items-center gap-4 h-[5.5rem] px-6 sm:px-8 lg:px-12 border-b shrink-0">
        <StickyNote className="w-9 h-9 text-primary" />
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">AI Note Composer</h1>
          <p className="text-muted-foreground">Turn raw thoughts into structured clarity.</p>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {/* Notes List */}
        <aside className="w-1/3 max-w-xs border-r overflow-y-auto flex flex-col">
          <div className="p-4 border-b">
             <Button className="w-full" onClick={handleAddNewNote}>New Note</Button>
          </div>
          <ScrollArea className="flex-1">
            <nav className="p-4 pt-2 space-y-1">
              {notes.map(note => (
                <button
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg truncate text-sm",
                    activeNoteId === note.id ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-accent/50"
                  )}
                >
                  {note.title}
                </button>
              ))}
            </nav>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-y-auto">
          {activeNote ? (
            <>
              {/* Editor Panel */}
              <div className="flex flex-col md:border-r relative">
                <ScrollArea className="flex-1">
                  <div className="p-6 sm:p-8">
                    <Textarea
                      placeholder="Start with a brain dump... just write anything that comes to mind."
                      value={activeNote.rawContent}
                      onChange={handleContentChange}
                      className="w-full h-full min-h-[calc(100vh-15rem)] text-base resize-none border-0 focus-visible:ring-0 p-0 bg-transparent"
                    />
                  </div>
                </ScrollArea>
                <div className="p-4 border-t sticky bottom-0 bg-card/80 backdrop-blur-sm">
                  <Button onClick={handleCompose} disabled={isLoading || !activeNote.rawContent.trim()} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Composing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Organize with AI
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Output Panel */}
              <ScrollArea className="flex-1">
                <div className="p-6 sm:p-8">
                  {isLoading && !activeNote.composedContent ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground min-h-[calc(100vh-15rem)]">
                      <div className="text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                        <p className="mt-4">AI is thinking...</p>
                      </div>
                    </div>
                  ) : activeNote.composedContent ? (
                    <div className={cn(
                        "prose dark:prose-invert max-w-none",
                        isLoading && "opacity-50 transition-opacity"
                    )}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeNote.composedContent}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-center text-muted-foreground min-h-[calc(100vh-15rem)]">
                      <div>
                        <Bot className="mx-auto h-12 w-12" />
                        <p className="mt-2">Your organized note will appear here.</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="md:col-span-2 flex-1 flex items-center justify-center text-center text-muted-foreground">
              <div className="space-y-2">
                <StickyNote className="mx-auto h-12 w-12" />
                <p>Select a note to view or create a new one.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
