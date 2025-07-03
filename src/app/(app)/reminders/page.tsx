'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRemindersContext, type Reminder } from '@/context/reminders-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function RemindersPage() {
  const { reminders, updateReminder, loading } = useRemindersContext();
  const [editingField, setEditingField] = useState<{ id: string; field: keyof Reminder } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id: string, field: keyof Reminder) => {
    updateReminder(id, { [field]: e.target.value });
  };
  
  const handleInputBlur = () => {
    setEditingField(null);
  };
  
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      setEditingField(null);
    }
  };

  const isEditing = (id: string, field: keyof Reminder) => {
    return editingField?.id === id && editingField?.field === field;
  };
  
  const formatReminderTime = (time: string) => {
      return new Date(time).toLocaleString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
      });
  }

  return (
    <div className="flex flex-1 flex-col p-6 sm:p-8 lg:p-12 notebook-lines-journal">
      <header className="flex items-center gap-4 h-[5.25rem]">
        <Bell className="w-9 h-9 text-primary" />
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Reminders</h1>
          <p className="text-muted-foreground">Stay on top of everything important.</p>
        </div>
      </header>

      <div className="space-y-6 mt-7">
        <h2 className="text-xl font-semibold">Upcoming</h2>
        <div className="space-y-2">
          {loading ? (
             [...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-4 -mx-4">
                    <Skeleton className="h-9 w-9 rounded-full shrink-0 mt-1" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-5 w-24 shrink-0" />
                </div>
             ))
          ) : reminders.length > 0 ? (
            reminders.map((reminder) => (
              <div key={reminder.id} className="flex items-start gap-4 p-4 -mx-4 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-1">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-1 items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-semibold cursor-pointer" onClick={() => setEditingField({ id: reminder.id, field: 'title' })}>
                      {isEditing(reminder.id, 'title') ? (
                        <Input
                            defaultValue={reminder.title}
                            onBlur={(e) => { handleInputChange(e, reminder.id, 'title'); handleInputBlur(); }}
                            onKeyDown={(e) => { if(e.key === 'Enter') { handleInputChange(e as any, reminder.id, 'title'); handleInputBlur(); } }}
                            autoFocus
                            className="font-semibold h-8"
                          />
                      ) : (
                        <p className="leading-tight">{reminder.title}</p>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground mt-1 cursor-pointer" onClick={() => setEditingField({ id: reminder.id, field: 'notes' })}>
                      {isEditing(reminder.id, 'notes') ? (
                        <Textarea
                            defaultValue={reminder.notes || ''}
                            onBlur={(e) => { handleInputChange(e, reminder.id, 'notes'); handleInputBlur(); }}
                            autoFocus
                            className="text-sm text-muted-foreground min-h-0"
                          />
                      ) : (
                        <p className="leading-tight">{reminder.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground cursor-pointer shrink-0" onClick={() => setEditingField({ id: reminder.id, field: 'time' })}>
                    {isEditing(reminder.id, 'time') ? (
                      <Input
                        type="datetime-local"
                        defaultValue={reminder.time.substring(0, 16)}
                        onBlur={(e) => { handleInputChange(e, reminder.id, 'time'); handleInputBlur(); }}
                        onKeyDown={(e) => { if(e.key === 'Enter') { handleInputChange(e as any, reminder.id, 'time'); handleInputBlur(); } }}
                        autoFocus
                        className="text-sm text-muted-foreground h-8"
                      />
                    ) : (
                      <p className="leading-tight">{formatReminderTime(reminder.time)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-16">
              <Bell className="mx-auto h-12 w-12" />
              <h3 className="mt-4 text-lg font-semibold">No Reminders Found</h3>
              <p className="mt-2 text-sm">You're all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
