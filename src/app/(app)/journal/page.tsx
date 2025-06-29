import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const entries = [
  {
    id: '1',
    date: 'October 24, 2024',
    title: 'A breakthrough idea',
    content: 'Had a fantastic idea for a new feature today. It involves using machine learning to predict user intent and proactively suggest actions. This could be a game-changer for the app...',
  },
  {
    id: '2',
    date: 'October 23, 2024',
    title: 'Reflections on the week',
    content: 'This week was productive but challenging. Managed to close out the main deliverables for the Q3 report. Feeling a bit drained but accomplished. Need to remember to take a proper break this weekend.',
  },
  {
    id: '3',
    date: 'October 21, 2024',
    title: 'Random thought',
    content: 'Why do we call it a "building" when it\'s already built?',
  },
];

export default function JournalPage() {
  return (
    <div className="flex flex-col space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Journal</h1>
          <p className="text-muted-foreground">Your private space for thoughts and ideas.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Entry
        </Button>
      </div>

      <div className="space-y-8">
        {entries.map((entry, index) => (
          <div key={entry.id}>
            <h2 className="text-2xl font-semibold tracking-tight">{entry.title}</h2>
            <p className="text-sm text-muted-foreground mb-4">{entry.date}</p>
            <p className="text-muted-foreground leading-relaxed">{entry.content}</p>
            {index < entries.length - 1 && <Separator className="my-8" />}
          </div>
        ))}
      </div>
    </div>
  );
}
