import { PlusCircle, Bell, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="flex flex-col space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Reminders</h1>
          <p className="text-muted-foreground">Stay on top of everything important.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Reminder
        </Button>
      </div>

      <div className="space-y-4">
        {reminders.map((reminder) => (
          <Card key={reminder.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-lg">{reminder.title}</CardTitle>
                    <CardDescription>{reminder.notes}</CardDescription>
                </div>
                <Bell className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>{reminder.time}</span>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}