
'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRemindersContext, type Reminder } from '@/context/reminders-context';

export default function RemindersPage() {
  const { reminders, updateReminder } = useRemindersContext();
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
          {reminders.map((reminder) => (
            <div key={reminder.id} className="flex items-start gap-4 p-4 -mx-4 rounded-lg hover:bg-secondary/50 transition-colors">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-1">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-1 items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="font-semibold cursor-pointer" onClick={() => setEditingField({ id: reminder.id, field: 'title' })}>
                    {isEditing(reminder.id, 'title') ? (
                      <Input
                          value={reminder.title}
                          onChange={(e) => handleInputChange(e, reminder.id, 'title')}
                          onBlur={handleInputBlur}
                          onKeyDown={handleInputKeyDown}
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
                          value={reminder.notes}
                          onChange={(e) => handleInputChange(e, reminder.id, 'notes')}
                          onBlur={handleInputBlur}
                          onKeyDown={handleInputKeyDown}
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
                      value={reminder.time}
                      onChange={(e) => handleInputChange(e, reminder.id, 'time')}
                      onBlur={handleInputBlur}
                      onKeyDown={handleInputKeyDown}
                      autoFocus
                      className="text-sm text-muted-foreground h-8"
                    />
                  ) : (
                    <p className="leading-tight">{reminder.time}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
