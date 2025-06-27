"use server";

import { createTaskFromChat } from "@/ai/flows/create-task-from-chat";
import { trackExpenseFromChat } from "@/ai/flows/track-expense-from-chat";

const simpleResponses: { [key: string]: string } = {
    "hello": "Hello! How can I help you today? 😊",
    "hi": "Hi there! What can I do for you?",
    "hey": "Hey! What's on your mind?",
    "heyy": "Heyy! 😊 What's up?",
    "sup": "Not much! Ready to help you organize. What's the plan?",
    "yo": "Yo! What can I help you with?",
    "thanks": "You're welcome!",
    "thank you": "You're welcome! 😊",
    "bye": "Goodbye! Talk to you later.",
    "goodbye": "Goodbye! Hope to see you soon."
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
