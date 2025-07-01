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
  FileText,
  Notebook,
  Plane,
  ChefHat,
  Music,
  Film,
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
  work: Briefcase,
  shopping: ShoppingCart,
  groceries: ShoppingCart,
  buy: ShoppingCart,
  book: Book,
  read: Book,
  study: Book,
  movie: Film,
  film: Film,
  music: Music,
  song: Music,
  recipe: ChefHat,
  food: ChefHat,
  cook: ChefHat,
  travel: Plane,
  trip: Plane,
  vacation: Plane,
};

const defaultIcons: LucideIcon[] = [StickyNote, FileText, Notebook];

// A simple, deterministic hash function to pick a default icon
// based on the note's ID. This prevents hydration errors.
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function getIconForTitle(title: string, id: string): ElementType {
  const lowerCaseTitle = title.toLowerCase();
  
  for (const keyword in iconMap) {
    if (lowerCaseTitle.includes(keyword)) {
      return iconMap[keyword];
    }
  }
  
  // If no keyword found, pick a default icon based on a hash of the ID.
  const hash = simpleHash(id);
  const index = hash % defaultIcons.length;
  return defaultIcons[index];
}
