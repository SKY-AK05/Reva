import { DollarSign } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const expenses = [
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

export default function ExpensesPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center gap-4">
        <DollarSign className="w-8 h-8 text-muted-foreground" />
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track and manage your spending.</p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="w-[150px]">Category</TableHead>
            <TableHead className="w-[120px]">Date</TableHead>
            <TableHead className="w-[100px] text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="notebook-lines">
          {expenses.map((expense) => (
            <TableRow key={expense.id} className="border-none">
              <TableCell className="h-12 align-middle font-medium">{expense.item}</TableCell>
              <TableCell className="h-12 align-middle">{expense.category}</TableCell>
              <TableCell className="h-12 align-middle">{expense.date}</TableCell>
              <TableCell className="h-12 align-middle text-right">${expense.amount.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
