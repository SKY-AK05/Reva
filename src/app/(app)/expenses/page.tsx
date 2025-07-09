
'use client';

import React, { useState, useMemo } from 'react';
import { HandCoins, Trash2, Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useExpensesContext, type Expense, type NewExpense } from '@/context/expenses-context';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const expenseFormSchema = z.object({
  item: z.string().min(1, 'Item name is required.'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0.'),
  category: z.string().optional(),
  date: z.string().min(1, 'Date is required.'),
});


export default function ExpensesPage() {
  const { expenses, updateExpense, deleteExpense, loading, addExpense } = useExpensesContext();
  const [editingCell, setEditingCell] = useState<{ id: string; column: keyof Expense } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof expenseFormSchema>>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      item: '',
      amount: 0,
      category: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  async function onSubmit(values: z.infer<typeof expenseFormSchema>) {
    await addExpense(values as NewExpense);
    form.reset();
    setIsDialogOpen(false);
  }

  const groupedExpenses = useMemo(() => {
    if (loading || !expenses) return {};
    
    // The expenses from the context are already sorted by date descending.
    return expenses.reduce((acc, expense) => {
        const month = format(new Date(expense.date), 'MMMM yyyy');
        if (!acc[month]) {
            acc[month] = { expenses: [], total: 0 };
        }
        acc[month].expenses.push(expense);
        acc[month].total += Number(expense.amount);
        return acc;
    }, {} as Record<string, { expenses: Expense[], total: number }>);
  }, [expenses, loading]);

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
          defaultValue={expense[column] as string | number}
          onChange={(e) => handleInputChange(e, expense.id, column)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          autoFocus
          className="h-auto p-0 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      );
    }
    if (column === 'amount') {
      return `$${Number(expense.amount).toFixed(2)}`;
    }
    if (column === 'date') {
      // Format the date for better readability
      return format(new Date(expense.date), 'MMM dd, yyyy');
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
        <div className="ml-auto">
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Expense
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Expense</DialogTitle>
                    <DialogDescription>
                        Enter the details of your new expense here.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                        <FormField control={form.control} name="item" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Item</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Coffee" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="amount" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 4.50" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="category" render={({ field }) => (
                             <FormItem>
                                <FormLabel>Category</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Food & Drink" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="date" render={({ field }) => (
                             <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter className="pt-4">
                            <Button type="submit">Add Expense</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="space-y-8 mt-11">
        {loading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="border border-primary rounded-lg p-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-center justify-between p-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : Object.keys(groupedExpenses).length > 0 ? (
          Object.entries(groupedExpenses).map(([month, { expenses: monthExpenses, total }]) => (
            <div key={month}>
              <h2 className="text-xl font-semibold mb-3">{month}</h2>
              <div className="border border-primary rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="hidden sm:table-cell">Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-[50px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthExpenses.map((expense) => (
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
                        <TableCell className="text-right">
                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete this expense.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteExpense(expense.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                        <TableCell colSpan={3} className="text-right font-bold text-base">Month Total</TableCell>
                        <TableCell className="text-right font-bold text-base">${total.toFixed(2)}</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-16">
            <HandCoins className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">No Expenses Found</h3>
            <p className="mt-2 text-sm">Track your first expense from the chat.</p>
          </div>
        )}
      </div>
    </div>
  );
}
