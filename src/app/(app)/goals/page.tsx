
'use client';

import { useState } from 'react';
import { Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useGoalsContext, type Goal } from '@/context/goals-context';

export default function GoalsPage() {
  const { goals, updateGoal } = useGoalsContext();
  const [editingField, setEditingField] = useState<{ id: string; field: keyof Goal | 'progress' } | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id: string, field: 'title' | 'description' | 'status') => {
    updateGoal(id, { [field]: e.target.value });
  };

  const handleSliderChange = (id: string, value: number[]) => {
      updateGoal(id, { progress: value[0] });
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
    <div className="flex flex-1 flex-col p-6 sm:p-8 lg:p-12 notebook-lines-journal">
       <header className="flex items-center gap-4 h-[5.25rem]">
        <Target className="w-9 h-9 text-primary" />
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">Your ambitions, tracked and realized.</p>
        </div>
      </header>
      
      <div className="space-y-8 mt-7">
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
              <div className="flex flex-col gap-2">
                <div className="cursor-pointer" onClick={() => setEditingField({ id: goal.id, field: 'progress' })}>
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
                </div>
                <div className="text-sm text-muted-foreground cursor-pointer" onClick={() => setEditingField({ id: goal.id, field: 'status' })}>
                    {editingField?.id === goal.id && editingField?.field === 'status' ? (
                        <Input
                            value={goal.status}
                            onChange={(e) => handleInputChange(e, goal.id, 'status')}
                            onBlur={handleInputBlur}
                            onKeyDown={handleInputKeyDown}
                            autoFocus
                            className="h-7 text-sm"
                        />
                    ) : (
                       <span className="text-sm text-muted-foreground">{goal.status}</span>
                    )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
