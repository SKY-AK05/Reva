'use client';

import { useState } from 'react';
import { HandCoins } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { useExpensesContext, type Expense } from '@/context/expenses-context';

export default function ExpensesPage() {
  const { expenses, updateExpense } = useExpensesContext();
  const [editingCell, setEditingCell] = useState<{ id: string; column: keyof Expense } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, id: string, column: keyof Expense) => {
    const value = column === 'amount' ? parseFloat(e.target.value) || 0 : e.target.value;
    updateExpense(id, { [column]: value });
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
          type={column === 'amount' ? 'number' : column === 'date' ? 'date' : 'text'}
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
      return `₹${expense.amount.toFixed(2)}`;
    }
    return expense[column];
  };


  return (
    <div className="flex flex-1 flex-col p-6 sm:p-8 lg:p-12 notebook-lines">
      <div className="h-[5.5rem] flex items-center">
        <header className="flex items-center gap-4">
          <HandCoins className="w-9 h-9 text-primary" />
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
            <p className="text-muted-foreground">Track and manage your spending.</p>
          </div>
        </header>
      </div>
      
      <div className="border border-primary rounded-lg mt-11">
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
