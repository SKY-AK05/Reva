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

export async function processUserChat(chatInput: string): Promise<string> {
    const lowerCaseInput = chatInput.toLowerCase().trim();

    // Layer 1: Simple Rule-Based Logic (no API calls)
    if (simpleResponses[lowerCaseInput]) {
        return simpleResponses[lowerCaseInput];
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
