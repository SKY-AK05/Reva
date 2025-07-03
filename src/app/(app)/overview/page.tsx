'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, DollarSign, Bell, Target, CalendarDays, Wallet } from 'lucide-react';
import { useTasksContext } from '@/context/tasks-context';
import { useExpensesContext } from '@/context/expenses-context';
import { useRemindersContext } from '@/context/reminders-context';
import { useGoalsContext } from '@/context/goals-context';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

export default function OverviewPage() {
  const { tasks, loading: tasksLoading } = useTasksContext();
  const { expenses, loading: expensesLoading } = useExpensesContext();
  const { reminders, loading: remindersLoading } = useRemindersContext();
  const { goals, loading: goalsLoading } = useGoalsContext();

  const loading = tasksLoading || expensesLoading || remindersLoading || goalsLoading;

  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const upcomingTasks = tasks.filter(task => !task.completed).slice(0, 5);
  const recentExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const overviewCards = [
    { title: 'Active Tasks', value: tasks.filter(t => !t.completed).length, icon: CheckSquare, colorClass: 'text-chart-1' },
    { title: 'Total Expenses', value: `₹${totalExpenses.toFixed(2)}`, icon: DollarSign, colorClass: 'text-chart-2' },
    { title: 'Upcoming Reminders', value: reminders.length, icon: Bell, colorClass: 'text-chart-3' },
    { title: 'Active Goals', value: goals.filter(g => g.progress < 100).length, icon: Target, colorClass: 'text-chart-4' },
  ];

  return (
    <div className="flex flex-1 flex-col p-6 sm:p-8 lg:p-12 notebook-lines">
      <div className="h-[5.5rem] flex items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Library</h1>
          <p className="text-muted-foreground">An overview of all your notebooks.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-11">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          overviewCards.map((card) => (
            <Card key={card.title} className="bg-secondary/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className={`h-5 w-5 ${card.colorClass}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
       <div className="grid gap-4 md:grid-cols-2 mt-6">
         <Card className="bg-secondary/50">
            <CardHeader>
                <CardTitle>Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : upcomingTasks.length > 0 ? (
                    <ul className="space-y-4">
                        {upcomingTasks.map((task) => (
                            <li key={task.id} className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                    <CalendarDays className="h-4 w-4 text-primary" />
                                </div>
                                <p className="flex-1 text-sm font-medium truncate">{task.description}</p>
                                <Badge variant="outline" className="text-xs">
                                  {task.dueDate ? formatDistanceToNow(new Date(task.dueDate), { addSuffix: true }) : 'No due date'}
                                </Badge>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground text-sm text-center py-8">You have no upcoming tasks. Great job!</p>
                )}
            </CardContent>
         </Card>
         <Card className="bg-secondary/50">
            <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                   <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : recentExpenses.length > 0 ? (
                    <ul className="space-y-4">
                        {recentExpenses.map((expense) => (
                            <li key={expense.id} className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chart-2/10">
                                    <Wallet className="h-4 w-4 text-chart-2" />
                                </div>
                                <p className="flex-1 text-sm font-medium truncate">{expense.item}</p>
                                <span className="text-sm font-semibold">₹{Number(expense.amount).toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground text-sm text-center py-8">You have no recent expenses.</p>
                )}
            </CardContent>
         </Card>
       </div>
    </div>
  );
}
