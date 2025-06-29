
'use client';

import { useState } from 'react';
import { Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

const initialGoals = [
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

type Goal = typeof initialGoals[0];

export default function GoalsPage() {
  const [goals, setGoals] = useState(initialGoals);
  const [editingField, setEditingField] = useState<{ id: string; field: keyof Goal | 'progress' } | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id: string, field: 'title' | 'description') => {
    setGoals(goals.map(goal => (goal.id === id ? { ...goal, [field]: e.target.value } : goal)));
  };

  const handleSliderChange = (id: string, value: number[]) => {
      setGoals(goals.map(goal => (goal.id === id ? { ...goal, progress: value[0] } : goal)));
  }
  
  const handleInputBlur = () => {
    setEditingField(null);
  };
  
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setEditingField(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col space-y-8 p-6 sm:p-8 lg:p-12 notebook-lines-journal">
       <header className="flex items-center gap-4">
        <Target className="w-8 h-8 text-muted-foreground" />
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">Your ambitions, tracked and realized. Click text or progress bars to edit.</p>
        </div>
      </header>
      
      <div className="space-y-8">
        {goals.map((goal) => (
            <div key={goal.id} className="">
              <div className="mb-2">
                <h3 className="font-semibold text-lg cursor-pointer" onClick={() => setEditingField({ id: goal.id, field: 'title' })}>
                  {editingField?.id === goal.id && editingField?.field === 'title' ? (
                     <Input
                        value={goal.title}
                        onChange={(e) => handleInputChange(e, goal.id, 'title')}
                        onBlur={handleInputBlur}
                        onKeyDown={handleInputKeyDown}
                        autoFocus
                      />
                  ) : goal.title}
                </h3>
                <p className="text-sm text-muted-foreground cursor-pointer" onClick={() => setEditingField({ id: goal.id, field: 'description' })}>
                  {editingField?.id === goal.id && editingField?.field === 'description' ? (
                     <Textarea
                        value={goal.description}
                        onChange={(e) => handleInputChange(e, goal.id, 'description')}
                        onBlur={handleInputBlur}
                        autoFocus
                      />
                  ) : goal.description}
                </p>
              </div>
              <div className="flex flex-col gap-2 cursor-pointer" onClick={() => setEditingField({ id: goal.id, field: 'progress' })}>
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
                <span className="text-sm text-muted-foreground">{goal.status}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
