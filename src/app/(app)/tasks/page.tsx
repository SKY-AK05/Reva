
'use client';

import { useState } from 'react';
import { CheckSquare, Trash2, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTasksContext, type Task, type NewTask } from '@/context/tasks-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const priorityVariant = {
  high: 'destructive',
  medium: 'secondary',
  low: 'outline',
};

const taskFormSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  dueDate: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
});

export default function TasksPage() {
  const { tasks, addTask, updateTask, toggleTaskCompletion, deleteTask, loading } = useTasksContext();
  const [editingCell, setEditingCell] = useState<{ id: string; column: keyof Omit<Task, 'completed'> } | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      description: '',
      dueDate: '',
      priority: 'medium',
    },
  });

  async function onSubmit(values: z.infer<typeof taskFormSchema>) {
    await addTask(values as NewTask);
    form.reset();
    setIsAdding(false);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, id: string, column: 'description' | 'dueDate') => {
    updateTask(id, { [column]: e.target.value });
  };

  const handleCheckedChange = (id: string, checked: boolean) => {
     toggleTaskCompletion(id, !!checked);
  }

  const handlePriorityChange = (id: string, priority: string) => {
      updateTask(id, { priority: priority as Task['priority'] });
      setEditingCell(null);
  }

  const handleInputBlur = () => {
    setEditingCell(null);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setEditingCell(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col p-6 sm:p-8 lg:p-12 notebook-lines">
      <div className="h-[5.5rem] flex items-center">
        <header className="flex items-center gap-4">
          <CheckSquare className="w-9 h-9 text-primary" />
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">Everything you need to get done.</p>
          </div>
        </header>
        <div className="ml-auto">
            <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? 'outline' : 'default'}>
                <Plus className="mr-2 h-4 w-4" />
                {isAdding ? 'Cancel' : 'New Task'}
            </Button>
        </div>
      </div>

      {isAdding && (
         <Card className="my-6 animate-fade-in-up">
            <CardHeader>
                <CardTitle>Create a New Task</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem className="sm:col-span-3">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Finish the report" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="dueDate" render={({ field }) => (
                            <FormItem className="sm:col-span-1">
                                <FormLabel>Due Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="priority" render={({ field }) => (
                            <FormItem className="sm:col-span-1">
                                <FormLabel>Priority</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Priority" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="sm:col-span-1 flex items-end justify-end gap-2">
                           <Button type="submit" className="w-full">Add Task</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
         </Card>
      )}
      
      <div className="border border-primary rounded-lg mt-11">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Task</TableHead>
              <TableHead className="w-[150px]">Due</TableHead>
              <TableHead className="w-[120px]">Priority</TableHead>
              <TableHead className="w-[50px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                </TableRow>
              ))
            ) : tasks.length > 0 ? (
              tasks.map((task) => (
                <TableRow key={task.id} data-state={task.completed ? 'completed' : ''} className="data-[state=completed]:text-muted-foreground data-[state=completed]:line-through">
                  <TableCell>
                    <Checkbox id={`task-${task.id}`} checked={task.completed} onCheckedChange={(checked) => handleCheckedChange(task.id, !!checked)} />
                  </TableCell>
                  <TableCell className="font-medium cursor-pointer" onClick={() => setEditingCell({ id: task.id, column: 'description' })}>
                    {editingCell?.id === task.id && editingCell?.column === 'description' ? (
                      <Input
                        defaultValue={task.description}
                        onBlur={(e) => { handleInputChange(e, task.id, 'description'); handleInputBlur(); }}
                        onKeyDown={handleInputKeyDown}
                        autoFocus
                        className="h-auto p-0 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    ) : (
                      task.description
                    )}
                  </TableCell>
                  <TableCell className="cursor-pointer" onClick={() => setEditingCell({ id: task.id, column: 'dueDate' })}>
                    {editingCell?.id === task.id && editingCell?.column === 'dueDate' ? (
                      <Input
                        type="date"
                        defaultValue={task.dueDate || ''}
                        onBlur={(e) => { handleInputChange(e, task.id, 'dueDate'); handleInputBlur(); }}
                        onKeyDown={handleInputKeyDown}
                        autoFocus
                        className="h-auto p-0 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    ) : (
                      task.dueDate
                    )}
                  </TableCell>
                  <TableCell className="cursor-pointer" onClick={() => setEditingCell({ id: task.id, column: 'priority' })}>
                    {editingCell?.id === task.id && editingCell?.column === 'priority' ? (
                      <Select 
                          defaultValue={task.priority}
                          onValueChange={(value) => handlePriorityChange(task.id, value)}
                          onOpenChange={(isOpen) => !isOpen && setEditingCell(null)}
                        >
                            <SelectTrigger className="capitalize h-8 w-full">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                      <Badge variant={priorityVariant[task.priority as keyof typeof priorityVariant]} className="capitalize">
                        {task.priority}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this task.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteTask(task.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <CheckSquare className="h-12 w-12" />
                    <h3 className="font-semibold">No tasks found</h3>
                    <p className="text-sm">Create your first task from the chat or the "New Task" button.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
