import { Bell } from 'lucide-react';

const reminders = [
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

export default function RemindersPage() {
  return (
    <div className="flex flex-col space-y-8 p-6 sm:p-8 lg:p-12 notebook-lines-journal">
      <header className="flex items-center gap-4">
        <Bell className="w-8 h-8 text-muted-foreground" />
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
              <span className="font-medium">{reminder.title}</span>
              <span className="text-muted-foreground text-sm">{reminder.time}</span>
              <span className="text-muted-foreground/80 pl-4 border-l-2 border-primary ml-2 mt-1 pt-1 pb-1">{reminder.notes}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
