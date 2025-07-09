
'use client';

import { useState } from 'react';
import { Target, Trash2, Plus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
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
import { Slider } from '@/components/ui/slider';
import { useGoalsContext, type Goal, type NewGoal } from '@/context/goals-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const goalFormSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().optional(),
});

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal, loading } = useGoalsContext();
  const [editingField, setEditingField] = useState<{ id: string; field: keyof Goal | 'progress' } | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const form = useForm<z.infer<typeof goalFormSchema>>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof goalFormSchema>) {
    await addGoal(values as NewGoal);
    form.reset();
    setIsAdding(false);
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id: string, field: 'title' | 'description' | 'status') => {
    updateGoal(id, { [field]: e.target.value });
  };

  const handleSliderChange = (id: string, value: number[]) => {
      updateGoal(id, { progress: value[0] });
  }
  
  const handleInputBlur = () => {
    setEditingField(null);
  };
  
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !(e.target as HTMLElement).matches('textarea')) {
      setEditingField(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col p-6 sm:p-8 lg:p-12 notebook-lines-journal">
       <header className="flex items-center gap-4 h-[5.25rem]">
        <Target className="w-9 h-9 text-primary" />
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">Your ambitions, tracked and realized.</p>
        </div>
        <div className="ml-auto">
            <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? 'outline' : 'default'}>
                <Plus className="mr-2 h-4 w-4" />
                {isAdding ? 'Cancel' : 'New Goal'}
            </Button>
        </div>
      </header>

      {isAdding && (
         <Card className="my-6 animate-fade-in-up">
            <CardHeader>
                <CardTitle>Set a New Goal</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Goal Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Run a marathon" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description (Optional)</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="e.g., Train 4 times a week and complete a 42km race." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="flex justify-end gap-2">
                           <Button type="submit">Add Goal</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
         </Card>
      )}
      
      <div className="space-y-8 mt-7">
        {loading ? (
            [...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-2 w-full" />
                </div>
            ))
        ) : goals.length > 0 ? (
          goals.map((goal) => (
            <div key={goal.id} className="group relative">
              <div className="mb-2">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg cursor-pointer" onClick={() => setEditingField({ id: goal.id, field: 'title' })}>
                      {editingField?.id === goal.id && editingField?.field === 'title' ? (
                         <Input
                            defaultValue={goal.title}
                            onBlur={(e) => { handleInputChange(e, goal.id, 'title'); handleInputBlur(); }}
                            onKeyDown={(e) => { if(e.key === 'Enter') { handleInputChange(e as any, goal.id, 'title'); handleInputBlur(); } }}
                            autoFocus
                            className="h-auto p-0 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-semibold"
                          />
                      ) : goal.title}
                    </h3>
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
                                This will permanently delete your goal: "{goal.title}".
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteGoal(goal.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
                <p className="text-sm text-muted-foreground cursor-pointer" onClick={() => setEditingField({ id: goal.id, field: 'description' })}>
                  {editingField?.id === goal.id && editingField?.field === 'description' ? (
                     <Textarea
                        defaultValue={goal.description || ''}
                        onBlur={(e) => { handleInputChange(e, goal.id, 'description'); handleInputBlur(); }}
                        autoFocus
                        className="h-auto p-0 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                        rows={1}
                      />
                  ) : goal.description}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="cursor-pointer" onClick={() => setEditingField({ id: goal.id, field: 'progress' })}>
                    {editingField?.id === goal.id && editingField?.field === 'progress' ? (
                        <div onMouseLeave={() => setEditingField(null)}>
                            <Slider
                                defaultValue={[goal.progress]}
                                max={100}
                                step={1}
                                onValueChange={(value) => handleSliderChange(goal.id, value)}
                            />
                        </div>
                    ) : (
                        <Progress value={goal.progress} className="h-2" />
                    )}
                </div>
                <div className="text-sm text-muted-foreground cursor-pointer" onClick={() => setEditingField({ id: goal.id, field: 'status' })}>
                    {editingField?.id === goal.id && editingField?.field === 'status' ? (
                        <Input
                            defaultValue={goal.status || ''}
                            onBlur={(e) => { handleInputChange(e, goal.id, 'status'); handleInputBlur(); }}
                            onKeyDown={(e) => { if(e.key === 'Enter') { handleInputChange(e as any, goal.id, 'status'); handleInputBlur(); } }}
                            autoFocus
                            className="h-auto p-0 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                        />
                    ) : (
                       <span className="text-sm text-muted-foreground">{goal.status} ({goal.progress}%)</span>
                    )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-16">
            <Target className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">No Goals Found</h3>
            <p className="mt-2 text-sm">You haven't set any goals yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
