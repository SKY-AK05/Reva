
'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const initialReminders = [
  {
    id: '1',
    title: 'Follow up with a client',
    time: '2024-10-25 10:00 AM',
    notes: 'Discuss the new proposal.',
  },
  {
    id: '2',
    title: 'Pay credit card bill',
    time: '2024-10-26 05:00 PM',
    notes: 'Due tomorrow.',
  },
  {
    id: '3',
    title: 'Team meeting',
    time: '2024-10-28 11:30 AM',
    notes: 'Project sync-up in Room 3.',
  },
];

type Reminder = typeof initialReminders[0];

export default function RemindersPage() {
  const [reminders, setReminders] = useState(initialReminders);
  const [editingField, setEditingField] = useState<{ id: string; field: keyof Reminder } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id: string, field: keyof Reminder) => {
    setReminders(reminders.map(rem => (rem.id === id ? { ...rem, [field]: e.target.value } : rem)));
  };
  
  const handleInputBlur = () => {
    setEditingField(null);
  };
  
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Allow shift+enter for textarea
      setEditingField(null);
    }
  };

  const renderEditable = (reminder: Reminder, field: keyof Reminder) => {
    const isEditing = editingField?.id === reminder.id && editingField?.field === field;
    
    if (isEditing) {
      if (field === 'notes') {
        return (
          <Textarea
            value={reminder[field]}
            onChange={(e) => handleInputChange(e, reminder.id, field)}
            onBlur={handleInputBlur}
            autoFocus
            className="text-base"
          />
        );
      }
      return (
        <Input
          value={reminder[field]}
          onChange={(e) => handleInputChange(e, reminder.id, field)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          autoFocus
        />
      );
    }
    return reminder[field];
  };

  return (
    <div className="flex flex-1 flex-col space-y-8 p-6 sm:p-8 lg:p-12 notebook-lines-journal">
      <header className="flex items-center gap-4">
        <Bell className="w-9 h-9 text-primary" />
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Reminders</h1>
          <p className="text-muted-foreground">Stay on top of everything important.</p>
        </div>
      </header>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Upcoming</h2>
        <ul className="space-y-6">
          {reminders.map((reminder) => (
            <li key={reminder.id} className="flex flex-col gap-1">
              <span className="font-medium cursor-pointer" onClick={() => setEditingField({ id: reminder.id, field: 'title' })}>
                {renderEditable(reminder, 'title')}
              </span>
              <span className="text-muted-foreground text-sm cursor-pointer" onClick={() => setEditingField({ id: reminder.id, field: 'time' })}>
                {renderEditable(reminder, 'time')}
              </span>
              <span 
                className="text-muted-foreground/80 pl-4 border-l-2 border-primary ml-2 mt-1 pt-1 pb-1 cursor-pointer"
                onClick={() => setEditingField({ id: reminder.id, field: 'notes' })}
              >
                {renderEditable(reminder, 'notes')}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
