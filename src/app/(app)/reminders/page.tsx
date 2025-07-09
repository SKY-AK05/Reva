
'use client';

import { useState } from 'react';
import { Bell, Trash2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from '@/components/ui/textarea';
import { useRemindersContext, type Reminder, type NewReminder } from '@/context/reminders-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const reminderFormSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  time: z.string().min(1, 'Time is required.'),
  notes: z.string().optional(),
});


export default function RemindersPage() {
  const { reminders, addReminder, updateReminder, deleteReminder, loading } = useRemindersContext();
  const [editingField, setEditingField] = useState<{ id: string; field: keyof Reminder } | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const form = useForm<z.infer<typeof reminderFormSchema>>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      title: '',
      notes: '',
      time: '',
    },
  });

  async function onSubmit(values: z.infer<typeof reminderFormSchema>) {
    await addReminder(values as NewReminder);
    form.reset();
    setIsAdding(false);
  }

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
        <div className="ml-auto">
            <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? 'outline' : 'default'}>
                <Plus className="mr-2 h-4 w-4" />
                {isAdding ? 'Cancel' : 'New Reminder'}
            </Button>
        </div>
      </header>
      
      {isAdding && (
        <Card className="my-6 animate-fade-in-up">
            <CardHeader>
                <CardTitle>Create a New Reminder</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Call mom" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="time" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Time</FormLabel>
                                <FormControl>
                                    <Input type="datetime-local" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="notes" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Notes (Optional)</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="e.g., Discuss vacation plans" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="flex justify-end gap-2">
                           <Button type="submit">Add Reminder</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
      )}

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
              <div key={reminder.id} className="flex items-start gap-4 p-4 -mx-4 rounded-lg hover:bg-secondary/50 transition-colors group">
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
                            className="font-semibold h-auto p-0 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
                            className="text-sm text-muted-foreground min-h-0 h-auto p-0 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            rows={1}
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
                        className="text-sm text-muted-foreground h-auto p-0 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    ) : (
                      <p className="leading-tight">{formatReminderTime(reminder.time)}</p>
                    )}
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your reminder for "{reminder.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteReminder(reminder.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
