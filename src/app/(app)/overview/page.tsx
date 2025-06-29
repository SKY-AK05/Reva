import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, DollarSign, Bell, Target } from 'lucide-react';

const overviewCards = [
  { title: 'Tasks', value: '12', icon: CheckSquare, colorClass: 'text-chart-1' },
  { title: 'Expenses', value: '₹6,799.00', icon: DollarSign, colorClass: 'text-chart-2' },
  { title: 'Reminders', value: '3 Upcoming', icon: Bell, colorClass: 'text-chart-3' },
  { title: 'Goals', value: '5 in Progress', icon: Target, colorClass: 'text-chart-4' },
];

const upcomingTasks = [
  { id: '1', description: 'Finish Q3 report for work', dueDate: 'Tomorrow' },
  { id: '2', description: 'Schedule dentist appointment', dueDate: 'In 3 days' },
  { id: '3', description: 'Call mom', dueDate: 'Friday' },
  { id: '4', description: 'Buy birthday gift for Sarah', dueDate: 'Next week' },
  { id: '5', description: 'Renew car insurance', dueDate: 'Oct 31st' },
];

const recentExpenses = [
  { id: '1', description: 'Lunch with team', amount: 1250.00 },
  { id: '2', description: 'Coffee', amount: 250.00 },
  { id: '3', description: 'Monthly subscription', amount: 999.00 },
  { id: '4', description: 'Groceries from store', amount: 3500.00 },
  { id: '5', description: 'Movie tickets', amount: 800.00 },
];

export default function OverviewPage() {
  return (
    <div className="flex flex-1 flex-col p-6 sm:p-8 lg:p-12 notebook-lines">
      <div className="h-[5.5rem] flex items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Library</h1>
          <p className="text-muted-foreground">An overview of all your notebooks.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-11">
        {overviewCards.map((card) => (
          <Card key={card.title} className="bg-secondary/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.colorClass}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
       <div className="grid gap-4 md:grid-cols-2 mt-6">
         <Card className="bg-secondary/50">
            <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
                {upcomingTasks.length > 0 ? (
                    <ul className="space-y-3">
                        {upcomingTasks.map((task) => (
                            <li key={task.id} className="flex justify-between items-center text-sm">
                                <span>{task.description}</span>
                                <span className="text-muted-foreground">{task.dueDate}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground">You have no upcoming tasks.</p>
                )}
            </CardContent>
         </Card>
         <Card className="bg-secondary/50">
            <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
                {recentExpenses.length > 0 ? (
                    <ul className="space-y-3">
                        {recentExpenses.map((expense) => (
                            <li key={expense.id} className="flex justify-between items-center text-sm">
                                <span>{expense.description}</span>
                                <span className="font-medium">₹{expense.amount.toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground">You have no recent expenses.</p>
                )}
            </CardContent>
         </Card>
       </div>
    </div>
  );
}
