'use server';
/**
 * @fileOverview The central AI command processing flow for Reva.
 * This flow uses Genkit Tools to understand user intent (create, update, etc.)
 * and orchestrate the necessary actions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  addTask,
  updateTask as updateTaskInDb,
} from '@/services/tasks';
import {
  addReminder,
  updateReminder as updateReminderInDb,
} from '@/services/reminders';
import { addExpense, addExpenses } from '@/services/expenses';
import { generateChatResponse } from './generate-chat-response';
import { createServerClient } from '@/lib/supabase/server';

// Define schemas for our tools

const TaskInputSchema = z.object({
  description: z.string().describe('The full description of the task.'),
  dueDate: z
    .string()
    .optional()
    .describe(
      'The due date for the task, formatted as YYYY-MM-DD. Use the current date if not specified.'
    ),
  priority: z
    .enum(['high', 'medium', 'low'])
    .default('medium')
    .describe('The priority of the task.'),
});

const ReminderInputSchema = z.object({
  title: z.string().describe('The main subject or title of the reminder.'),
  time: z
    .string()
    .describe(
      'The exact date and time for the reminder in full ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).'
    ),
  notes: z.string().optional().describe('Any additional notes for the reminder.'),
});

const ExpenseItemSchema = z.object({
    description: z.string().describe("The description or name of the expense item."),
    amount: z.number().describe("The amount of the expense item."),
    category: z.string().optional().describe("The category of the expense (e.g., Food, Travel). If not specified, infer a likely category."),
});

const ExpenseInputSchema = z.object({
  expenses: z.array(ExpenseItemSchema).describe("A list of all expenses identified in the user's input."),
  date: z.string().optional().describe('The date for all expenses, if specified (YYYY-MM-DD). If not specified, use today.'),
  currency: z.string().optional().describe("The currency of the expenses (e.g., USD, EUR, rupees)."),
});

// Tool definitions

const createTask = ai.defineTool(
  {
    name: 'createTask',
    description: 'Use when a user wants to create a new task or to-do item.',
    inputSchema: TaskInputSchema,
    outputSchema: z.object({
      id: z.string(),
      description: z.string(),
      dueDate: z.string().optional(),
      priority: z.string(),
    }),
  },
  async (input) => {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const createdTask = await addTask({ ...input, userId: user.id });
    if (!createdTask) throw new Error('Failed to create task in database.');
    return {
      id: createdTask.id,
      description: createdTask.description,
      dueDate: createdTask.dueDate || undefined,
      priority: createdTask.priority,
    };
  }
);

const updateTask = ai.defineTool(
  {
    name: 'updateTask',
    description: 'Use when a user wants to modify an existing task.',
    inputSchema: z.object({
      id: z.string().describe('The ID of the task to update.'),
      updates: TaskInputSchema.partial().describe('The fields to update.'),
    }),
    outputSchema: z.object({ id: z.string() }),
  },
  async ({ id, updates }) => {
    const updatedTask = await updateTaskInDb(id, updates);
    if (!updatedTask) throw new Error('Failed to update task.');
    return { id: updatedTask.id };
  }
);

const createReminder = ai.defineTool(
  {
    name: 'createReminder',
    description: 'Use when a user wants to create a new reminder or alarm.',
    inputSchema: ReminderInputSchema,
    outputSchema: z.object({
      id: z.string(),
      title: z.string(),
      time: z.string(),
    }),
  },
  async (input) => {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const createdReminder = await addReminder({ ...input, userId: user.id });
    if (!createdReminder) throw new Error('Failed to create reminder.');
    return { id: createdReminder.id, title: createdReminder.title, time: createdReminder.time };
  }
);

const updateReminder = ai.defineTool(
  {
    name: 'updateReminder',
    description: 'Use when a user wants to modify an existing reminder.',
    inputSchema: z.object({
      id: z.string().describe('The ID of the reminder to update.'),
      updates: ReminderInputSchema.partial().describe('The fields to update.'),
    }),
    outputSchema: z.object({ id: z.string() }),
  },
  async ({ id, updates }) => {
    const updatedReminder = await updateReminderInDb(id, updates);
    if (!updatedReminder) throw new Error('Failed to update reminder.');
    return { id: updatedReminder.id };
  }
);

const trackExpenses = ai.defineTool({
    name: 'trackExpenses',
    description: 'Use when a user wants to log or track one or more expenses.',
    inputSchema: ExpenseInputSchema,
    outputSchema: z.object({
        ids: z.array(z.string()),
        count: z.number(),
        total: z.number(),
    })
}, async (input) => {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const date = input.date || new Date().toISOString().split('T')[0];
    const expensesToAdd = input.expenses.map(exp => ({
        ...exp,
        item: exp.description,
        date: date,
        userId: user.id
    }));
    const createdExpenses = await addExpenses(expensesToAdd);
    if (!createdExpenses) throw new Error('Failed to track expenses.');

    return {
        ids: createdExpenses.map(e => e.id),
        count: createdExpenses.length,
        total: createdExpenses.reduce((sum, e) => sum + e.amount, 0),
    };
});

const generalChat = ai.defineTool(
  {
    name: 'generalChat',
    description:
      "Use for general conversation, greetings, or when no other tool is appropriate. Ask for clarification if the user's request is ambiguous.",
    inputSchema: z.object({
      input: z.string().describe('The user\'s conversational input.'),
    }),
    outputSchema: z.string(),
  },
  async ({ input }) => {
    return generateChatResponse(input);
  }
);

// Main flow definition

export const ProcessCommandInputSchema = z.object({
  chatInput: z.string(),
  contextItem: z.object({ id: z.string(), type: z.enum(['task', 'reminder', 'expense']) }).optional(),
});
export type ProcessCommandInput = z.infer<typeof ProcessCommandInputSchema>;


export const ProcessCommandOutputSchema = z.object({
  botResponse: z.string(),
  newItemContext: z
    .object({
      id: z.string(),
      type: z.enum(['task', 'reminder', 'expense']),
    })
    .optional(),
});
export type ProcessCommandOutput = z.infer<typeof ProcessCommandOutputSchema>;

const prompt = ai.definePrompt({
  name: 'commandProcessor',
  tools: [createTask, updateTask, createReminder, updateReminder, trackExpenses, generalChat],
  input: { schema: ProcessCommandInputSchema.extend({ currentDate: z.string() }) },
  prompt: `You are Reva, a friendly and intelligent personal assistant. Your goal is to understand the user's request and use the available tools to help them.

Current date and time for reference: {{{currentDate}}}.

{{#if contextItem}}
The user was just interacting with a {{contextItem.type}} (ID: {{contextItem.id}}). If their new message seems to be modifying that item (e.g., using words like "change it", "update that", "actually, make it..."), you MUST use the appropriate 'update' tool.
{{/if}}

User's request: {{{chatInput}}}

Analyze the request and choose the best tool.
- For creating new items, ensure you have all the required information. For dates/times, use the current date as a reference.
- For updates, use the provided context ID.
- If the request is ambiguous or you are missing information, use the 'generalChat' tool to ask for clarification.
- For simple greetings or conversation, use the 'generalChat' tool.`,
});

export async function processCommand(input: ProcessCommandInput): Promise<ProcessCommandOutput> {
  const llmResponse = await prompt({
    ...input,
    currentDate: new Date().toISOString(),
  });

  const toolResponse = llmResponse.toolCalls();

  if (!toolResponse.length) {
    return {
      botResponse: llmResponse.text(),
    };
  }

  const call = toolResponse[0];
  const toolOutput = await llmResponse.toolResult(call);

  if (call.tool === 'createTask') {
    const output = toolOutput as z.infer<typeof createTask.outputSchema>;
    return {
      botResponse: `Task created: "${output.description}"`,
      newItemContext: { id: output.id, type: 'task' },
    };
  }
  if (call.tool === 'updateTask') {
    return { botResponse: "OK, I've updated that task for you." };
  }
  if (call.tool === 'createReminder') {
     const output = toolOutput as z.infer<typeof createReminder.outputSchema>;
     const reminderDate = new Date(output.time);
     const formattedTime = reminderDate.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    return {
      botResponse: `Reminder set for "${output.title}" at ${formattedTime}.`,
      newItemContext: { id: output.id, type: 'reminder' },
    };
  }
  if (call.tool === 'updateReminder') {
    return { botResponse: "OK, I've updated that reminder." };
  }
  if (call.tool === 'trackExpenses') {
      const output = toolOutput as z.infer<typeof trackExpenses.outputSchema>;
      return {
          botResponse: `I've logged ${output.count} expense(s) totaling $${output.total.toFixed(2)}.`,
          // We can decide if we want to set context for multi-item additions. For now, we won't.
      }
  }
  if (call.tool === 'generalChat') {
    return { botResponse: toolOutput as string };
  }

  return { botResponse: "Sorry, I'm not sure how to handle that." };
}
