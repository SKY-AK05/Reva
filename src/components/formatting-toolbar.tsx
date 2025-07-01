'use client';

import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Zap, // Added
} from 'lucide-react';
import type { CSSProperties } from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export type FormatType =
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'code'
  | 'h1'
  | 'h2'
  | 'bulletList'
  | 'orderedList'
  | 'blockquote';

// Add new type for AI actions
export type AiActionType = 'generateChart';

interface FormattingToolbarProps {
  onFormat: (formatType: FormatType) => void;
  onAiAction: (actionType: AiActionType) => void; // Added
  className?: string;
  style?: CSSProperties;
}

export function FormattingToolbar({
  onFormat,
  onAiAction, // Added
  className,
  style,
}: FormattingToolbarProps) {
  // Prevent clicks on the toolbar from deselecting the text in the textarea
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const buttons = [
    { type: 'bold', icon: Bold, label: 'Bold' },
    { type: 'italic', icon: Italic, label: 'Italic' },
    { type: 'strikethrough', icon: Strikethrough, label: 'Strikethrough' },
    { type: 'code', icon: Code, label: 'Code' },
  ] as const;

  const headings = [
    { type: 'h1', icon: Heading1, label: 'Heading 1' },
    { type: 'h2', icon: Heading2, label: 'Heading 2' },
  ] as const;

  const lists = [
    { type: 'bulletList', icon: List, label: 'Bullet List' },
    { type: 'orderedList', icon: ListOrdered, label: 'Ordered List' },
    { type: 'blockquote', icon: Quote, label: 'Blockquote' },
  ] as const;

  const aiActions = [
    { type: 'generateChart', icon: Zap, label: 'Generate Chart' },
  ] as const;

  return (
    <div
      className={cn(
        'absolute z-10 flex items-center gap-1 rounded-lg border bg-card p-1 shadow-lg',
        className
      )}
      style={style}
      onMouseDown={handleMouseDown}
    >
      {buttons.map((btn) => (
        <Button
          key={btn.type}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onFormat(btn.type)}
          aria-label={btn.label}
        >
          <btn.icon className="h-4 w-4" />
        </Button>
      ))}
      <Separator orientation="vertical" className="mx-1 h-6" />
      {headings.map((btn) => (
        <Button
          key={btn.type}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onFormat(btn.type)}
          aria-label={btn.label}
        >
          <btn.icon className="h-4 w-4" />
        </Button>
      ))}
      <Separator orientation="vertical" className="mx-1 h-6" />
      {lists.map((btn) => (
        <Button
          key={btn.type}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onFormat(btn.type)}
          aria-label={btn.label}
        >
          <btn.icon className="h-4 w-4" />
        </Button>
      ))}
       <Separator orientation="vertical" className="mx-1 h-6" />
      {aiActions.map((btn) => (
        <Button
          key={btn.type}
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary hover:text-primary"
          onClick={() => onAiAction(btn.type)}
          aria-label={btn.label}
        >
          <btn.icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}
