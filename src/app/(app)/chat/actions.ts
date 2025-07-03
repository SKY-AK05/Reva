"use server";

import { createServerClient } from "@/lib/supabase/server";
import { createTaskFromChat } from "@/ai/flows/create-task-from-chat";
import { trackExpenseFromChat } from "@/ai/flows/track-expense-from-chat";
import { createReminderFromChat } from "@/ai/flows/create-reminder-from-chat";
import { generateChatResponse } from "@/ai/flows/generate-chat-response";
import { simpleResponses } from "@/lib/chat-responses";
import { saveToTrainingMemory } from "@/services/memory";
import { addTask } from "@/services/tasks";
import { addExpense, addExpenses } from "@/services/expenses";
import { addReminder } from "@/services/reminders";
import { addChatMessage } from "@/services/chat";

/**
 * Calculates the Levenshtein distance between two strings.
 */
function levenshtein(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = new Array<number[]>(bn + 1);
  for (let i = 0; i <= bn; ++i) {
    let row = (matrix[i] = new Array<number>(an + 1));
    row[0] = i;
  }
  const firstRow = matrix[0];
  for (let j = 1; j <= an; ++j) {
    firstRow[j] = j;
  }
  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[bn][an];
}

/**
 * Finds the best response from a dictionary of commands using fuzzy matching.
 */
function findBestMatch(input: string, responses: { [key: string]: string }, threshold: number): string | null {
    if (!input) return null;
    if (responses[input]) return responses[input];

    let bestMatch: string | null = null;
    let minDistance = Infinity;

    for (const key of Object.keys(responses)) {
        const distance = levenshtein(input, key);
        if (distance < minDistance) {
            minDistance = distance;
            bestMatch = key;
        }
    }

    if (bestMatch && minDistance <= threshold) {
        return responses[bestMatch];
    }

    return null;
}

export async function processUserChat(chatInput: string): Promise<string> {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return "Please log in to continue.";
    }

    // Save user's message to the database
    await addChatMessage({ userId: user.id, sender: 'user', text: chatInput });

    const lowerCaseInput = chatInput.toLowerCase().trim();
    let botResponseText: string;

    // Layer 1: Fuzzy-matched Rule-Based Logic
    const simpleResponse = findBestMatch(lowerCaseInput, simpleResponses, 2);
    if (simpleResponse) {
        botResponseText = simpleResponse;
    }
    // Layer 2: Genkit-based intent detection
    else if (lowerCaseInput.includes('task') || lowerCaseInput.includes('todo') || lowerCaseInput.includes('add to my list')) {
        try {
            const result = await createTaskFromChat({ chatInput });
            await addTask({
                description: result.taskDescription,
                dueDate: result.dueDate,
                priority: result.priority,
                userId: user.id,
            });
            botResponseText = `Task created!\n\n**Description:** ${result.taskDescription}\n**Due:** ${result.dueDate}\n**Priority:** ${result.priority}`;
        } catch (e) {
            console.error(e);
            botResponseText = "I had trouble creating that task. Can you try rephrasing?";
        }
    }
    else if (lowerCaseInput.includes('expense') || lowerCaseInput.includes('spent') || lowerCaseInput.includes('cost') || lowerCaseInput.includes('$') || lowerCaseInput.includes('rupees')) {
        try {
            const result = await trackExpenseFromChat({ chatInput });
            if (result.needsClarification) {
                botResponseText = result.clarificationPrompt || "I need a bit more information to track that expense. Could you provide more details?";
            } else if (!result.expenses || result.expenses.length === 0) {
                botResponseText = "I couldn't find any expenses to track in your message. Could you try rephrasing?";
            } else {
                if (result.expenses.length === 1) {
                    const expense = result.expenses[0];
                    await addExpense({
                        item: expense.description,
                        amount: expense.amount,
                        category: expense.category,
                        date: result.date || new Date().toISOString().split('T')[0],
                        userId: user.id,
                    });
                    const currencySymbol = result.currency?.toLowerCase().includes('dollar') ? '$' : '₹';
                    botResponseText = `Expense tracked!\n\n**Item:** ${expense.description}\n**Amount:** ${currencySymbol}${expense.amount.toFixed(2)}\n**Category:** ${expense.category || 'N/A'}`;
                    if(result.date) botResponseText += `\n**Date:** ${result.date}`;
                } else {
                    const date = result.date || new Date().toISOString().split('T')[0];
                    const expensesToAdd = result.expenses.map(exp => ({
                        item: exp.description,
                        amount: exp.amount,
                        category: exp.category,
                        date: date,
                        userId: user.id
                    }));
                    await addExpenses(expensesToAdd);
                    
                    const currencySymbol = result.currency?.toLowerCase().includes('dollar') ? '$' : '₹';
                    const totalAmount = result.expenses.reduce((sum, item) => sum + item.amount, 0);

                    botResponseText = "Okay, I've recorded your expenses:\n\n";
                    botResponseText += "| Item | Amount | Category |\n";
                    botResponseText += "|:---|---:|:---|\n";
                    result.expenses.forEach(item => {
                        botResponseText += `| ${item.description} | ${currencySymbol}${item.amount.toFixed(2)} | ${item.category || 'N/A'} |\n`;
                    });

                    botResponseText += `\n**Total:** ${currencySymbol}${totalAmount.toFixed(2)}`;
                    if(result.date) botResponseText += `\n**Date:** ${result.date}`;
                }
            }
        } catch (e) {
            console.error(e);
            botResponseText = "I had trouble tracking that expense. Can you try rephrasing?";
        }
    }
    else if (lowerCaseInput.includes('remind me') || lowerCaseInput.includes('reminder') || lowerCaseInput.includes('set an alarm')) {
        try {
            const result = await createReminderFromChat({ chatInput });
            const reminderDate = new Date(result.remindAt);
            await addReminder({
                title: result.reminderDescription,
                time: reminderDate.toISOString(),
                notes: `Reminder set from chat`,
                userId: user.id
            });
            botResponseText = `Reminder set!\n\n**For:** ${result.reminderDescription}\n**When:** ${reminderDate.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}`;
        } catch (e) {
            console.error(e);
            botResponseText = "I had trouble setting that reminder. Can you try rephrasing?";
        }
    }
    // Layer 3: General AI Fallback
    else {
        try {
            botResponseText = await generateChatResponse(chatInput);
            await saveToTrainingMemory(chatInput, botResponseText, user.id);
        } catch (e: any) {
            console.error(e);
            if (e.message && (e.message.includes('API key not valid') || e.message.includes('API key is missing'))) {
                botResponseText = "It looks like your Google AI API key is invalid or missing. Please go to your project files, open the `.env` file, and make sure `GOOGLE_API_KEY` is set correctly.";
            } else {
                botResponseText = "Sorry, I had a little trouble thinking of a response. Could you try again?";
            }
        }
    }

    // Save bot's response to the database
    await addChatMessage({ userId: user.id, sender: 'bot', text: botResponseText });

    return botResponseText;
}
