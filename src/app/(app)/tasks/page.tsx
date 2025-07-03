
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
import { useTasksContext, type Task } from '@/context/tasks-context';

const priorityVariant = {
  high: 'destructive',
  medium: 'secondary',
  low: 'outline',
};

export default function TasksPage() {
  const { tasks, updateTask, toggleTaskCompletion } = useTasksContext();
  const [editingCell, setEditingCell] = useState<{ id: string; column: keyof Omit<Task, 'completed'> } | null>(null);

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
      </div>
      
      <div className="border border-primary rounded-lg mt-11">
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
            {tasks.length > 0 ? (
              tasks.map((task) => (
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
                        type="date"
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <CheckSquare className="h-12 w-12" />
                    <h3 className="font-semibold">No tasks found</h3>
                    <p className="text-sm">Create your first task from the chat.</p>
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
