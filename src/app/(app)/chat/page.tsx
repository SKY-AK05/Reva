import ChatInterface from '@/components/chat-interface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, DollarSign, Bell, Target } from 'lucide-react';

const overviewCards = [
  { title: 'Tasks', value: '12', icon: CheckSquare, colorClass: 'text-chart-1' },
  { title: 'Expenses', value: '$258.50', icon: DollarSign, colorClass: 'text-chart-2' },
  { title: 'Reminders', value: '3 Upcoming', icon: Bell, colorClass: 'text-chart-3' },
  { title: 'Goals', value: '5 in Progress', icon: Target, colorClass: 'text-chart-4' },
];

export default function ChatPage() {
  return (
    <div className="relative h-full">
      <div className="h-full">
        <ChatInterface />
      </div>
      <div className="hidden lg:grid grid-cols-1 gap-4 w-52 absolute top-6 right-6">
        {overviewCards.map((card) => (
          <Card key={card.title}>
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
    </div>
  );
}
