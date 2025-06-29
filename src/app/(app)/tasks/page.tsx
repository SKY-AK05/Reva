
'use client';

import { useState } from 'react';
import { CheckSquare } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const initialTasks = [
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

type Task = typeof initialTasks[0];

const priorityVariant = {
  high: 'destructive',
  medium: 'secondary',
  low: 'outline',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [editingCell, setEditingCell] = useState<{ id: string; column: keyof Task } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, id: string, column: 'description' | 'dueDate') => {
    const newTasks = tasks.map(task => {
      if (task.id === id) {
        return { ...task, [column]: e.target.value };
      }
      return task;
    });
    setTasks(newTasks);
  };

  const handleCheckedChange = (id: string, checked: boolean) => {
     setTasks(tasks.map(task => (task.id === id ? { ...task, completed: checked } : task)));
  }

  const handlePriorityChange = (id: string, priority: string) => {
      setTasks(tasks.map(task => (task.id === id ? { ...task, priority } : task)));
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
    <div className="flex flex-1 flex-col space-y-8 p-6 sm:p-8 lg:p-12 notebook-lines">
      <header className="flex items-center gap-4">
        <CheckSquare className="w-8 h-8 text-muted-foreground" />
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Everything you need to get done. Click a cell to edit.</p>
        </div>
      </header>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Task</TableHead>
              <TableHead className="w-[150px]">Due</TableHead>
              <TableHead className="w-[120px] text-right">Priority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} data-state={task.completed ? 'completed' : ''} className="data-[state=completed]:text-muted-foreground data-[state=completed]:line-through">
                <TableCell>
                  <Checkbox id={`task-${task.id}`} checked={task.completed} onCheckedChange={(checked) => handleCheckedChange(task.id, !!checked)} />
                </TableCell>
                <TableCell className="font-medium cursor-pointer" onClick={() => setEditingCell({ id: task.id, column: 'description' })}>
                  {editingCell?.id === task.id && editingCell?.column === 'description' ? (
                    <Input
                      value={task.description}
                      onChange={(e) => handleInputChange(e, task.id, 'description')}
                      onBlur={handleInputBlur}
                      onKeyDown={handleInputKeyDown}
                      autoFocus
                      className="h-8"
                    />
                  ) : (
                    task.description
                  )}
                </TableCell>
                <TableCell className="cursor-pointer" onClick={() => setEditingCell({ id: task.id, column: 'dueDate' })}>
                  {editingCell?.id === task.id && editingCell?.column === 'dueDate' ? (
                    <Input
                      value={task.dueDate}
                      onChange={(e) => handleInputChange(e, task.id, 'dueDate')}
                      onBlur={handleInputBlur}
                      onKeyDown={handleInputKeyDown}
                      autoFocus
                      className="h-8"
                    />
                  ) : (
                    task.dueDate
                  )}
                </TableCell>
                <TableCell className="text-right cursor-pointer" onClick={() => setEditingCell({ id: task.id, column: 'priority' })}>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
