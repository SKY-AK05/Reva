import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, DollarSign, Bell, Target } from 'lucide-react';

const overviewCards = [
  { title: 'Tasks', value: '12', icon: CheckSquare, colorClass: 'text-chart-1' },
  { title: 'Expenses', value: '$258.50', icon: DollarSign, colorClass: 'text-chart-2' },
  { title: 'Reminders', value: '3 Upcoming', icon: Bell, colorClass: 'text-chart-3' },
  { title: 'Goals', value: '5 in Progress', icon: Target, colorClass: 'text-chart-4' },
];

export default function OverviewPage() {
  return (
    <div className="flex flex-col space-y-6 p-6 sm:p-8 lg:p-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Library</h1>
        <p className="text-muted-foreground">An overview of all your notebooks.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
       <div className="grid gap-4 md:grid-cols-2">
         <Card className="bg-secondary/50">
            <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">You have no upcoming tasks.</p>
            </CardContent>
         </Card>
         <Card className="bg-secondary/50">
            <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">You have no recent expenses.</p>
            </CardContent>
         </Card>
       </div>
    </div>
  );
}
