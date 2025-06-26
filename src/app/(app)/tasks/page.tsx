import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
    <div className="flex flex-col space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Everything you need to get done.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[120px]">Due Date</TableHead>
              <TableHead className="w-[100px]">Priority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} data-state={task.completed ? 'completed' : ''} className="data-[state=completed]:text-muted-foreground data-[state=completed]:line-through">
                <TableCell>
                  <Checkbox id={`task-${task.id}`} checked={task.completed} />
                </TableCell>
                <TableCell className="font-medium">{task.description}</TableCell>
                <TableCell>{task.dueDate}</TableCell>
                <TableCell>
                  <Badge variant={priorityVariant[task.priority as keyof typeof priorityVariant]}>
                    {task.priority}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}