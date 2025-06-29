import { CheckSquare } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

const tasks = [
  {
    id: '1',
    description: 'Buy groceries for the week',
    dueDate: '2024-10-25',
    priority: 'high',
    completed: false,
  },
  {
    id: '2',
    description: 'Finish the Q3 report for work',
    dueDate: '2024-10-26',
    priority: 'high',
    completed: false,
  },
  {
    id: '3',
    description: 'Schedule dentist appointment',
    dueDate: '2024-10-28',
    priority: 'medium',
    completed: true,
  },
  {
    id: '4',
    description: 'Call mom',
    dueDate: '2024-10-24',
    priority: 'low',
    completed: false,
  },
  {
    id: '5',
    description: 'Renew gym membership',
    dueDate: '2024-11-01',
    priority: 'medium',
    completed: false,
  },
];

const priorityVariant = {
  high: 'destructive',
  medium: 'secondary',
  low: 'outline',
};

export default function TasksPage() {
  return (
    <div className="flex flex-1 flex-col space-y-8 p-6 sm:p-8 lg:p-12 notebook-lines">
      <header className="flex items-center gap-4">
        <CheckSquare className="w-8 h-8 text-muted-foreground" />
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Everything you need to get done.</p>
        </div>
      </header>
      
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} data-state={task.completed ? 'completed' : ''} className="flex items-start gap-4 data-[state=completed]:text-muted-foreground data-[state=completed]:line-through h-11">
            <Checkbox id={`task-${task.id}`} checked={task.completed} className="mt-1" />
            <div className="flex-1">
              <label htmlFor={`task-${task.id}`} className="font-medium cursor-pointer">{task.description}</label>
              <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                <span>{task.dueDate}</span>
                &middot;
                <Badge variant={priorityVariant[task.priority as keyof typeof priorityVariant]} className="h-5 text-xs">
                  {task.priority}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
