"use server";

import { createTaskFromChat } from "@/ai/flows/create-task-from-chat";
import { trackExpenseFromChat } from "@/ai/flows/track-expense-from-chat";

const simpleResponses: { [key: string]: string } = {
  // Greetings
  "hello": "Hello! How can I help you today? 😊",
  "hi": "Hi there! What can I do for you?",
  "hey": "Hey! What's on your mind?",
  "heyy": "Heyy! 😊 What's up?",
  "heyyy": "Heyyy! Always good to hear from you! 😊",
  "yo": "Yo! What can I help you with?",
  "yo yo": "Yo yo! 😄 What’s the vibe today?",
  "yo bro": "Yo bro! What’s cooking?",
  "yo sis": "Hey sis! Need anything?",
  "hello there": "General Kenobi! 😉",
  "howdy": "Howdy partner! 🤠 What can I do for ya?",

  // Thank You / Bye
  "thanks": "You're welcome!",
  "thank you": "You're welcome! 😊",
  "bye": "Goodbye! Talk to you later.",
  "goodbye": "Goodbye! Hope to see you soon.",
  "see you": "See you! Take care!",
  "later": "Catch you later! 👋",
  "ttyl": "Talk to you later! 😊",

  // Daytime
  "good morning": "Good morning! ☀️ Ready to start the day?",
  "gm": "Good morning! ☀️ Let’s make today awesome!",
  "good afternoon": "Good afternoon! How’s your day going?",
  "ga": "Good afternoon! Hope your day is going great!",
  "good evening": "Good evening! Need help with anything before you wind down?",
  "ge": "Good evening! 🌇 How’s it going?",
  "good night": "Good night! 🌙 Sleep tight!",
  "gn": "Night night! 😴",

  // Casual Chatter
  "what's up": "Just hanging out, waiting to help you. 😄",
  "sup": "Not much! Ready to help you organize. What's the plan?",
  "ok": "Cool! Let me know if you need anything else.",
  "okay": "Got it! 😊",
  "cool": "Glad you think so! 😎",
  "nice": "Thanks! You're pretty awesome too.",
  "lol": "Haha! Glad you're having fun. 😂",
  "lmao": "🤣 You got jokes!",
  "brb": "Sure! I’ll be right here when you get back.",
  "idk": "No worries, I can help you figure it out!",
  "maybe": "No pressure. Let’s explore some options.",
  "yes": "Awesome! Let's do it.",
  "no": "Alright, let me know if you change your mind.",

  // Emotions
  "ugh": "Tough day? I’m here if you need anything. 💙",
  "bored": "Wanna plan something fun or productive?",
  "i'm tired": "Rest is important! Don’t forget to recharge. 😌",
  "i'm sad": "I'm here for you. 💙 Want to talk about it?",
  "i'm happy": "Yay! 😄 That’s amazing to hear!",
  "love you": "Aww, love you too! 💖",
  "miss you": "Missed you too! Let’s catch up. 😊",

  // Assistant Identity
  "yo assistant": "At your service! ⚡",
  "who are you": "I’m your smart life assistant. Here to help you stay on track!",
  "what can you do": "I can help you manage tasks, track habits, stay organized, and even chat a little. 😊",
  "where are you": "Right here, always ready to help! ✨",
  "what time is it": "You can check the clock, but I’m always on time 😉",
  "what day is it": "Time flies, doesn’t it? 📆",
  "who made you": "I was built by some awesome humans and powered by AI! 🤖",

  // Others
  "you're funny": "Haha thanks! I try. 😄",
  "stop": "Okay, I’ll chill for now. Just ping me if you need anything!",
  "go away": "Alright, I’ll give you some space. 😊",
  "come back": "Back and ready! Did you miss me? 😄",
  "help": "Of course! What do you need help with?",
};

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

    return "I can help with tasks and expenses. What would you like to do? For example, say 'create a task to buy milk' or 'I spent $5 on coffee'.";
}
