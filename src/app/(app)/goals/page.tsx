import { Target } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

const goals = [
  {
    id: '1',
    title: 'Read 3 books this month',
    description: 'Expand knowledge on product management and design.',
    progress: 33,
    status: '1/3 books read',
  },
  {
    id: '2',
    title: 'Save $1,000 for vacation',
    description: 'Contribute to the travel fund for the trip to Italy.',
    progress: 75,
    status: '$750 saved',
  },
  {
    id: '3',
    title: 'Go to the gym 12 times',
    description: 'Focus on strength training and cardio.',
    progress: 50,
    status: '6/12 sessions completed',
  },
   {
    id: '4',
    title: 'Complete the side project',
    description: 'Launch the MVP of the new app by end of Q4.',
    progress: 20,
    status: 'Design phase complete',
  },
];

export default function GoalsPage() {
  return (
    <div className="flex flex-col space-y-6">
       <div className="flex items-center gap-4">
        <Target className="w-8 h-8 text-muted-foreground" />
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">Your ambitions, tracked and realized.</p>
        </div>
      </div>
      <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Goal</TableHead>
              <TableHead className="hidden sm:table-cell">Description</TableHead>
              <TableHead className="w-[200px]">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="notebook-lines">
            {goals.map((goal) => (
              <TableRow key={goal.id} className="border-none">
                <TableCell className="h-12 align-middle font-medium">{goal.title}</TableCell>
                <TableCell className="h-12 align-middle hidden sm:table-cell">{goal.description}</TableCell>
                <TableCell className="h-12 align-middle">
                  <div className="flex flex-col gap-2">
                    <Progress value={goal.progress} className="h-2" />
                    <span className="text-sm text-muted-foreground">{goal.status}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </div>
  );
}
