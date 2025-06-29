import { DollarSign } from 'lucide-react';

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
    <div className="flex flex-1 flex-col space-y-8 p-6 sm:p-8 lg:p-12 notebook-lines">
      <header className="flex items-center gap-4">
        <DollarSign className="w-8 h-8 text-muted-foreground" />
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track and manage your spending.</p>
        </div>
      </header>
      
      <div className="border-t border-border/80">
          {expenses.map((expense) => (
            <div key={expense.id} className="grid grid-cols-3 gap-4 border-b border-border/80 h-11 items-center">
              <div className="font-medium col-span-2 sm:col-span-1">{expense.item}</div>
              <div className="hidden sm:block text-muted-foreground">{expense.category}</div>
              <div className="text-right text-muted-foreground">{expense.date}</div>
              <div className="text-right font-semibold col-start-3">${expense.amount.toFixed(2)}</div>
            </div>
          ))}
      </div>

    </div>
  );
}
