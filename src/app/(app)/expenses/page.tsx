
'use client';

import { useState } from 'react';
import { DollarSign } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';

const initialExpenses = [
  {
    id: '1',
    item: 'Coffee',
    category: 'Food',
    date: '2024-10-24',
    amount: 5.5,
  },
  {
    id: '2',
    item: 'Lunch with team',
    category: 'Food',
    date: '2024-10-23',
    amount: 25.0,
  },
  {
    id: '3',
    item: 'Monthly subscription',
    category: 'Software',
    date: '2024-10-22',
    amount: 12.0,
  },
  {
    id: '4',
    item: 'Groceries',
    category: 'Home',
    date: '2024-10-21',
    amount: 85.75,
  },
  {
    id: '5',
    item: 'Movie tickets',
    category: 'Entertainment',
    date: '2024-10-20',
    amount: 30.0,
  },
];

type Expense = typeof initialExpenses[0];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [editingCell, setEditingCell] = useState<{ id: string; column: keyof Expense } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, id: string, column: keyof Expense) => {
    const newExpenses = expenses.map(exp => {
      if (exp.id === id) {
        const value = column === 'amount' ? parseFloat(e.target.value) || 0 : e.target.value;
        return { ...exp, [column]: value };
      }
      return exp;
    });
    setExpenses(newExpenses);
  };

  const handleInputBlur = () => {
    setEditingCell(null);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setEditingCell(null);
    }
  };

  const renderCell = (expense: Expense, column: keyof Expense) => {
    if (editingCell?.id === expense.id && editingCell?.column === column) {
      return (
        <Input
          type={column === 'amount' ? 'number' : 'text'}
          value={expense[column] as string | number}
          onChange={(e) => handleInputChange(e, expense.id, column)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          autoFocus
          className="h-8"
        />
      );
    }
    if (column === 'amount') {
      return `$${expense.amount.toFixed(2)}`;
    }
    return expense[column];
  };


  return (
    <div className="flex flex-1 flex-col space-y-8 p-6 sm:p-8 lg:p-12 notebook-lines">
      <header className="flex items-center gap-4">
        <DollarSign className="w-8 h-8 text-muted-foreground" />
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track and manage your spending. Click on any cell to edit.</p>
        </div>
      </header>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium cursor-pointer" onClick={() => setEditingCell({ id: expense.id, column: 'item' })}>
                  {renderCell(expense, 'item')}
                </TableCell>
                <TableCell className="hidden sm:table-cell cursor-pointer" onClick={() => setEditingCell({ id: expense.id, column: 'category' })}>
                  {renderCell(expense, 'category')}
                </TableCell>
                <TableCell className="cursor-pointer" onClick={() => setEditingCell({ id: expense.id, column: 'date' })}>
                  {renderCell(expense, 'date')}
                </TableCell>
                <TableCell className="text-right font-semibold cursor-pointer" onClick={() => setEditingCell({ id: expense.id, column: 'amount' })}>
                   {renderCell(expense, 'amount')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}
