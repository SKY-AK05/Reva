"use server";

import { createTaskFromChat } from "@/ai/flows/create-task-from-chat";
import { trackExpenseFromChat } from "@/ai/flows/track-expense-from-chat";
import { generateChatResponse } from "@/ai/flows/generate-chat-response";
import { simpleResponses } from "@/lib/chat-responses";

/**
 * Calculates the Levenshtein distance between two strings.
 * This is the number of edits (insertions, deletions, substitutions)
 * needed to change one word into the other.
 */
function levenshtein(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) {
    return bn;
  }
  if (bn === 0) {
    return an;
  }
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
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1) // insertion or deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

/**
 * Finds the best response from a dictionary of commands using fuzzy matching.
 * @param input The user's input string.
 * @param responses A dictionary of command strings and their corresponding responses.
 * @param threshold The maximum Levenshtein distance to be considered a match.
 * @returns The matched response string or null if no match is found within the threshold.
 */
function findBestMatch(input: string, responses: { [key: string]: string }, threshold: number): string | null {
    if (!input) return null;

    // First, check for an exact match for performance
    if (responses[input]) {
        return responses[input];
    }

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
    const lowerCaseInput = chatInput.toLowerCase().trim();

    // Layer 1: Fuzzy-matched Rule-Based Logic (no API calls)
    const simpleResponse = findBestMatch(lowerCaseInput, simpleResponses, 2);
    if (simpleResponse) {
        return simpleResponse;
    }

    // Layer 2: Genkit-based intent detection (API calls)
    if (lowerCaseInput.includes('task') || lowerCaseInput.includes('todo') || lowerCaseInput.includes('remind me to')) {
        try {
            const result = await createTaskFromChat({ chatInput });
            return `Task created!\n\n**Description:** ${result.taskDescription}\n**Due:** ${result.dueDate}\n**Priority:** ${result.priority}`;
        } catch (e) {
            console.error(e);
            return "I had trouble creating that task. Can you try rephrasing?";
        }
    }

    if (lowerCaseInput.includes('expense') || lowerCaseInput.includes('spent') || lowerCaseInput.includes('cost') || lowerCaseInput.includes('$')) {
        try {
            const result = await trackExpenseFromChat({ chatInput });
            if (result.needsClarification) {
                return result.clarificationPrompt || "I need a bit more information to track that expense. Could you provide more details?";
            }
            let response = "Expense tracked!";
            if(result.amount) response += `\n\n**Amount:** $${result.amount.toFixed(2)}`;
            if(result.category) response += `\n**Category:** ${result.category}`;
            if(result.date) response += `\n**Date:** ${result.date}`;
            return response;
        } catch (e) {
            console.error(e);
            return "I had trouble tracking that expense. Can you try rephrasing?";
        }
    }

    // Layer 3: General AI Fallback
    try {
        const response = await generateChatResponse(chatInput);
        
        // TODO: Implement "Training Memory"
        // In the future, we would save the pair (chatInput, response)
        // to a database to improve the rule-based logic over time.

        return response;
    } catch (e) {
        console.error(e);
        return "Sorry, I had a little trouble thinking of a response. Could you try again?";
    }
}
