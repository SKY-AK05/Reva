import {
  StickyNote,
  Lightbulb,
  Users,
  Quote,
  ListTodo,
  Target,
  Briefcase,
  ShoppingCart,
  Book,
  type LucideIcon,
} from 'lucide-react';
import type { ElementType } from 'react';

const iconMap: { [key: string]: LucideIcon } = {
  idea: Lightbulb,
  thought: Lightbulb,
  meeting: Users,
  sync: Users,
  team: Users,
  quote: Quote,
  saying: Quote,
  task: ListTodo,
  todo: ListTodo,
  list: ListTodo,
  plan: Target,
  goal: Target,
  project: Briefcase,
  shopping: ShoppingCart,
  groceries: ShoppingCart,
  book: Book,
  read: Book,
};

export function getIconForTitle(title: string): ElementType {
  const lowerCaseTitle = title.toLowerCase();
  
  for (const keyword in iconMap) {
    if (lowerCaseTitle.includes(keyword)) {
      return iconMap[keyword];
    }
  }
  
  return StickyNote;
}
