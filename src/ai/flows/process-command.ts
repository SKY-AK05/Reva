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
import { addGoal, updateGoal as updateGoalInDb, getGoals } from '@/services/goals';
import { addJournalEntry } from '@/services/journal';
import { generateChatResponse } from './generate-chat-response';
import { createServerClient } from '@/lib/supabase/server';
import type { Goal } from '@/context/goals-context';

const ToneSchema = z.enum(['Neutral', 'GenZ', 'Sarcastic', 'Poetic']);
type Tone = z.infer<typeof ToneSchema>;

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

const GoalInputSchema = z.object({
    title: z.string().describe("The title of the user's goal."),
    description: z.string().optional().describe("A brief description of the goal, if provided."),
    progress: z.number().optional().describe("The completion percentage of the goal (0-100)."),
    status: z.string().optional().describe("The current status of the goal (e.g., 'In Progress', 'Completed').")
});

const JournalEntryInputSchema = z.object({
    content: z.string().describe("The user's thoughts or entry content for the journal."),
    title: z.string().optional().describe("The title of the journal entry. If not provided by the user, generate a concise one based on the content."),
});

const GoalOutputSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  progress: z.number(),
  status: z.string().nullable(),
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

const createGoal = ai.defineTool({
    name: 'createGoal',
    description: "Use when a user wants to set a new goal that is not in their existing goal list.",
    inputSchema: GoalInputSchema,
    outputSchema: GoalOutputSchema
}, async (input) => {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const createdGoal = await addGoal({
        ...input,
        userId: user.id,
        progress: input.progress || 0,
        status: input.status || 'Not Started'
    });
    if (!createdGoal) throw new Error('Failed to create goal in database.');
    return createdGoal;
});

const updateGoal = ai.defineTool({
    name: 'updateGoal',
    description: "Use when a user wants to modify an existing goal, such as updating its progress or status.",
    inputSchema: z.object({
        id: z.string().describe("The ID of the goal to update."),
        updates: GoalInputSchema.partial().describe("The fields to update."),
    }),
    outputSchema: GoalOutputSchema,
}, async ({ id, updates }) => {
    const updatedGoal = await updateGoalInDb(id, updates);
    if (!updatedGoal) throw new Error('Failed to update goal.');
    return updatedGoal;
});

const createJournalEntry = ai.defineTool({
    name: 'createJournalEntry',
    description: "Use when a user wants to write a journal entry, jot down thoughts, or record their feelings.",
    inputSchema: JournalEntryInputSchema,
    outputSchema: z.object({
        id: z.string(),
        title: z.string(),
    })
}, async (input) => {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const createdEntry = await addJournalEntry({
        title: input.title || 'Journal Entry',
        content: input.content,
        date: new Date().toISOString().split('T')[0],
        userId: user.id,
    });
    if (!createdEntry) throw new Error('Failed to create journal entry in database.');
    return { id: createdEntry.id, title: createdEntry.title };
});


const generalChat = ai.defineTool(
  {
    name: 'generalChat',
    description:
      "Use for general conversation, greetings, or when no other tool is appropriate. Ask for clarification if the user's request is ambiguous.",
    inputSchema: z.object({
      input: z.string().describe('The user\'s conversational input.'),
      tone: ToneSchema.describe('The requested conversational tone.'),
    }),
    outputSchema: z.string(),
  },
  async ({ input, tone }) => {
    return generateChatResponse(input, tone);
  }
);

// Main flow definition

const ChatHistoryItemSchema = z.object({
  role: z.enum(['user', 'bot']),
  content: z.string(),
});

const GoalSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    progress: z.number(),
    status: z.string().nullable(),
});

const ProcessCommandInputSchema = z.object({
  chatInput: z.string(),
  contextItem: z.object({ id: z.string(), type: z.enum(['task', 'reminder', 'expense', 'goal', 'journalEntry']) }).optional(),
  chatHistory: z.array(ChatHistoryItemSchema).optional().describe('The last few turns of the conversation.'),
  tone: ToneSchema.default('Neutral').describe('The desired personality for the response.'),
  existingGoals: z.array(GoalSchema).optional().describe("The user's current list of goals."),
});
export type ProcessCommandInput = z.infer<typeof ProcessCommandInputSchema>;

export type ProcessCommandOutput = {
  botResponse: string;
  actionIcon?: 'task' | 'reminder' | 'expense' | 'goal' | 'journalEntry';
  newItemContext?: {
    id: string;
    type: 'task' | 'reminder' | 'expense' | 'goal' | 'journalEntry';
  };
  updatedItemType?: 'task' | 'reminder' | 'expense' | 'goal';
  goal?: Goal;
};

const prompt = ai.definePrompt({
  name: 'commandProcessor',
  tools: [createTask, updateTask, createReminder, updateReminder, trackExpenses, createGoal, updateGoal, createJournalEntry, generalChat],
  input: { schema: ProcessCommandInputSchema.extend({ currentDate: z.string() }) },
  prompt: `You are Reva, a friendly and intelligent personal assistant. Your goal is to understand the user's NEWEST request by using the context from the conversation history and the user's existing data.

Current date and time for reference: {{{currentDate}}}.
The user wants you to speak in a '{{{tone}}}' tone. When using the 'generalChat' tool, you MUST pass this tone along.

---
**Conversation History (Oldest to Newest):**
{{#if chatHistory}}
  {{#each chatHistory}}
{{this.role}}: {{this.content}}
  {{/each}}
{{else}}
(No conversation history yet. This is the first message.)
{{/if}}
---

**CONTEXT & SPECIAL INSTRUCTIONS:**

{{#if contextItem}}
**CRITICAL CONTEXT**: The user's previous turn was about a {{contextItem.type}} with ID '{{contextItem.id}}'. Their new message ('{{{chatInput}}}') is a direct follow-up.
- **Your primary assumption must be to UPDATE the existing item.**
- If the user's message contains any change (e.g., "change it to...", "update progress to 50%", "actually, set the time to 8pm"), you MUST use the corresponding 'update' tool (e.g., 'updateGoal', 'updateTask') with the ID '{{contextItem.id}}'.
- Do NOT use a 'create' tool unless the user explicitly says "create a new...", "add another...", or a similar phrase that clearly indicates a separate item.
{{/if}}

{{#if existingGoals}}
**USER'S CURRENT GOALS:**
You have the user's list of current goals. Use this list to decide whether to update an existing goal or create a new one.
{{#each existingGoals}}
- **{{this.title}}** (ID: {{this.id}}, Progress: {{this.progress}}%, Status: {{this.status}})
{{/each}}

**Goal-Related Instructions:**
- When the user mentions a goal, first check if their intent matches one of the goals in the list above.
- If it's a match, you MUST use the \`updateGoal\` tool with the correct ID. For example, if they say "my goal is to finish the book", and a goal "Read 'The Great Gatsby'" exists, you should interpret this as an update to that goal's title or description.
- Only use the \`createGoal\` tool if the user's request is clearly about a brand new goal that is NOT on their list.
{{/if}}

**User's NEW Request:** {{{chatInput}}}

Analyze the NEW request based on the history and available context, then choose the best tool.
- **Updates vs. Creations:** If you have an item ID from the \`contextItem\` OR the user's request clearly refers to one of their \`existingGoals\`, your default action should be to UPDATE it.
- **Goals & Journaling:** Actively listen for phrases like "I want to achieve...", "My goal is...", or "I want to write down that..." to use the createGoal or createJournalEntry tools, but ONLY if there is no context suggesting an update.
- **Updates:** When updating an item, look for specific changes. For goals, this often involves updating the 'progress' percentage.
- **Title/Description:** If a 'title' for a reminder/goal or 'description' for a task is not explicitly stated, create a short, sensible one from the user's request. For a journal entry without a title, create one from the content.
- **Categories:** If the user logs an expense without a category, you MUST infer a logical one (e.g., 'Food & Drink', 'Transport', 'Shopping').
- **Dates/Times:** Always use the current date ({{{currentDate}}}) as a reference to resolve relative times like "tomorrow" or "in 2 hours."
- **Clarification:** Only use the 'generalChat' tool to ask for clarification if the user's intent is completely unclear.
- For simple greetings or conversation, use the 'generalChat' tool.`,
});

type Action = 'createTask' | 'updateTask' | 'createReminder' | 'updateReminder' | 'trackExpenses' | 'createGoal' | 'updateGoal' | 'createJournalEntry';

function generateToneResponse(action: Action, data: any, tone: Tone): string {
    const time = action.includes('Reminder') ? new Date(data.time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '';

    const responses = {
        Neutral: {
            createTask: `Task created: "${data.description}"`,
            updateTask: "OK, I've updated that task for you.",
            createReminder: `Reminder set for "${data.title}" at ${time}.`,
            updateReminder: "OK, I've updated that reminder.",
            trackExpenses: `I've logged ${data.count} expense(s) totaling $${data.total.toFixed(2)}.`,
            createGoal: `New goal set: "${data.title}". You can do it!`,
            updateGoal: "Goal updated. Keep up the great work!",
            createJournalEntry: `Journal entry created: "${data.title}".`,
        },
        GenZ: {
            createTask: `Bet. Task locked in: "${data.description}" 📝`,
            updateTask: "Aight, task updated. We're vibing ✨",
            createReminder: `Yoo, reminder set for "${data.title}" at ${new Date(data.time).toLocaleString(undefined, { timeStyle: 'short' })}. Don't forget! 💀`,
            updateReminder: "Updated that reminder for ya. No cap.",
            trackExpenses: `Got it. ${data.count} expense(s) logged. That's $${data.total.toFixed(2)} less for boba. 💅`,
            createGoal: `New goal: "${data.title}". Slay! 💅`,
            updateGoal: "You're crushing it! 🔥",
            createJournalEntry: `Vibe check... journal entry "${data.title}" saved. ✨`,
        },
        Sarcastic: {
            createTask: `Oh, fantastic, another task: "${data.description}". I'll just add that to the infinitely growing list. 🙃`,
            updateTask: "You changed your mind? Shocking. Fine, I've updated the task.",
            createReminder: `A reminder for "${data.title}" at ${time}. I'm sure you'll *totally* remember it this time.`,
            updateReminder: "Right, because the first time wasn't good enough. The reminder is updated.",
            trackExpenses: `Great, ${data.count} more expense(s) totaling $${data.total.toFixed(2)}. Your wallet must be so proud.`,
            createGoal: `A new goal, "${data.title}". How ambitious. I'll be here to watch you... not do it. Probably.`,
            updateGoal: "Oh, you actually made progress? Color me surprised. The goal is updated.",
            createJournalEntry: `Journal entry "${data.title}" is saved. I'll be sure not to read your secret thoughts. *wink*`,
        },
        Poetic: {
            createTask: `A new intention blossoms: "${data.description}". It is now woven into the tapestry of your day. ✨`,
            updateTask: "The path has shifted, and so the task transforms. It is done.",
            createReminder: `A gentle echo in time for "${data.title}", set for ${time}. May it find you well. 🌿`,
            updateReminder: "The echo's time has changed, a new moment to remember. The reminder is updated.",
            trackExpenses: `The flow of coin, noted. ${data.count} item(s) totaling $${data.total.toFixed(2)}, a fleeting moment in your journey's ledger.`,
            createGoal: `An ambition, "${data.title}", takes flight, a star to navigate your journey by. 🌟`,
            updateGoal: "A step is taken, the path unfolds. The goal breathes with new life.",
            createJournalEntry: `A whisper of thought, "${data.title}", captured now in quiet permanence. ✍️`,
        },
    };

    return responses[tone]?.[action] || responses.Neutral[action];
}


export async function processCommand(input: ProcessCommandInput): Promise<ProcessCommandOutput> {
  const goals = await getGoals();
  
  const llmResponse = await prompt({
    ...input,
    existingGoals: goals,
    currentDate: new Date().toISOString(),
  });

  const toolResponse = llmResponse.toolCalls;

  if (!toolResponse || !toolResponse.length) {
    const directResponse = await generateChatResponse(input.chatInput, input.tone);
    return {
      botResponse: llmResponse.text || directResponse,
    };
  }

  const call = toolResponse[0];
  const toolOutput = await llmResponse.toolResult(call);

  if (call.tool === 'generalChat') {
    return { botResponse: toolOutput as string };
  }

  const action = call.tool as Action;
  const botResponse = generateToneResponse(action, toolOutput, input.tone);
  const output: ProcessCommandOutput = { botResponse };

  // Set context and icon based on action
  if (action === 'createTask') {
    const taskData = toolOutput as z.infer<typeof createTask.outputSchema>;
    output.newItemContext = { id: taskData.id, type: 'task' };
    output.actionIcon = 'task';
  } else if (action === 'updateTask') {
    output.updatedItemType = 'task';
    output.actionIcon = 'task';
  } else if (action === 'createReminder') {
    const reminderData = toolOutput as z.infer<typeof createReminder.outputSchema>;
    output.newItemContext = { id: reminderData.id, type: 'reminder' };
    output.actionIcon = 'reminder';
  } else if (action === 'updateReminder') {
    output.updatedItemType = 'reminder';
    output.actionIcon = 'reminder';
  } else if (action === 'createGoal') {
    const goalData = toolOutput as Goal;
    output.newItemContext = { id: goalData.id, type: 'goal' };
    output.goal = goalData;
    output.actionIcon = 'goal';
  } else if (action === 'updateGoal') {
    const goalData = toolOutput as Goal;
    output.updatedItemType = 'goal';
    output.goal = goalData;
    output.actionIcon = 'goal';
  } else if (action === 'createJournalEntry') {
    const journalData = toolOutput as z.infer<typeof createJournalEntry.outputSchema>;
    output.newItemContext = { id: journalData.id, type: 'journalEntry' };
    output.actionIcon = 'journalEntry';
  } else if (action === 'trackExpenses') {
    output.actionIcon = 'expense';
  }
  
  return output;
}
