import { config } from 'dotenv';
config();

import '@/ai/flows/create-task-from-chat.ts';
import '@/ai/flows/track-expense-from-chat.ts';
import '@/ai/flows/generate-chat-response.ts';
import '@/ai/flows/create-reminder-from-chat.ts';
