import { config } from 'dotenv';
config();

import '@/ai/flows/process-command.ts';
import '@/ai/flows/generate-chat-response.ts';
import '@/ai/flows/compose-note.ts';
import '@/ai/flows/generate-chart-from-text.ts';
