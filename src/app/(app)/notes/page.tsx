'use client';

import { useState } from 'react';
import { StickyNote, Bot, Sparkles, Loader2, ListTodo, Key } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { getNoteSummary } from './actions';
import { cn } from '@/lib/utils';

// Types
type Summary = {
  title: string;
  summary: string;
  actionItems: string[];
  keyPoints: string[];
};

type Note = {
  id: string;
  title: string;
  content: string;
  summary: Summary | null;
};

// Initial Data
const initialNotes: Note[] = [
  {
    id: '1',
    title: 'Initial Idea',
    content: 'This is a sample note to get you started. You can write anything here - meeting notes, random thoughts, project plans, or even a journal entry. When you\'re ready, click the "Summarize with AI" button to see the magic happen!',
    summary: null,
  },
  {
    id: '2',
    title: 'Project Phoenix Plan',
    content: 'Okay, big meeting today about Project Phoenix. We need to finalize the roadmap. John thinks we should focus on the new dashboard first. Maria wants to prioritize the mobile app. I think we need to do both, but we have to start with the backend refactor. I need to remember to schedule a follow-up with the design team about the new mockups and also draft the Q3 goals for the leadership review. The deadline for the prototype is end of next month.',
    summary: {
      title: 'Project Phoenix Roadmap Discussion',
      summary: 'A summary of a meeting to finalize the Project Phoenix roadmap, discussing priorities between the dashboard, mobile app, and backend refactor.',
      actionItems: [
        'Schedule follow-up with the design team about mockups.',
        'Draft Q3 goals for leadership review.',
      ],
      keyPoints: [
        'John advocates for prioritizing the new dashboard.',
        'Maria suggests focusing on the mobile app first.',
        'The consensus is a backend refactor is the necessary first step.',
        'The prototype deadline is the end of next month.',
      ],
    },
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
      note.id === activeNoteId ? { ...note, content: e.target.value } : note
    ));
  };

  const handleSummarize = async () => {
    if (!activeNote || !activeNote.content.trim()) return;
    setIsLoading(true);
    try {
      const summaryResult = await getNoteSummary(activeNote.content);
      setNotes(notes.map(note =>
        note.id === activeNoteId ? { ...note, summary: summaryResult, title: summaryResult.title } : note
      ));
    } catch (error) {
      console.error("Failed to get summary:", error);
      // Here you could use a toast to show an error to the user
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      summary: null,
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };


  return (
    <div className="flex flex-1 flex-col h-full">
      <header className="flex items-center gap-4 h-[5.5rem] px-6 sm:px-8 lg:px-12 border-b shrink-0">
        <StickyNote className="w-9 h-9 text-primary" />
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Smart Notes</h1>
          <p className="text-muted-foreground">Capture your thoughts, let AI find the clarity.</p>
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
        <main className="flex-1 flex flex-col overflow-y-auto">
          {activeNote ? (
            <div className="flex-1 flex flex-col">
              <div className="p-6 sm:p-8 flex-1">
                <Textarea
                  placeholder="Start writing your note here..."
                  value={activeNote.content}
                  onChange={handleContentChange}
                  className="w-full h-full min-h-[300px] text-base resize-none border-0 focus-visible:ring-0 p-0 bg-transparent"
                />
              </div>
              <div className="p-6 sm:p-8 border-t bg-background/50 sticky bottom-0">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <p className="text-sm text-muted-foreground text-center sm:text-left">Let AI organize your thoughts into actionable insights.</p>
                    <Button onClick={handleSummarize} disabled={isLoading || !activeNote.content.trim()} className="w-full sm:w-auto">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Summarizing...
                        </>
                      ) : (
                         <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Summarize with AI
                        </>
                      )}
                    </Button>
                </div>
                {activeNote.summary && (
                  <Card className="mt-6 bg-secondary/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="w-6 h-6 text-primary" />
                        AI Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                       <div>
                          <h4 className="font-semibold mb-2">Summary</h4>
                          <p className="text-muted-foreground">{activeNote.summary.summary}</p>
                       </div>
                       
                       {(activeNote.summary.keyPoints.length > 0 || activeNote.summary.actionItems.length > 0) && <Separator />}
                       
                       {activeNote.summary.keyPoints.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Key className="w-4 h-4 text-muted-foreground" />
                                Key Points
                            </h4>
                            <ul className="space-y-2 pl-5 list-disc text-muted-foreground">
                              {activeNote.summary.keyPoints.map((point, index) => (
                                <li key={index}>{point}</li>
                              ))}
                            </ul>
                          </div>
                       )}

                       {activeNote.summary.actionItems.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <ListTodo className="w-4 h-4 text-muted-foreground" />
                                Action Items
                            </h4>
                            <ul className="space-y-2 pl-5 list-disc text-muted-foreground">
                              {activeNote.summary.actionItems.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
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
