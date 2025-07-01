'use server';
/**
 * @fileOverview An AI flow to generate chart data from unstructured text.
 *
 * - generateChartFromText - A function that handles chart data generation.
 * - GenerateChartFromTextInput - The input type for the function.
 * - GenerateChartFromTextOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChartFromTextInputSchema = z.object({
  selectedText: z
    .string()
    .describe('The block of text selected by the user to be converted into a chart.'),
});
export type GenerateChartFromTextInput = z.infer<typeof GenerateChartFromTextInputSchema>;

const GenerateChartFromTextOutputSchema = z.object({
    isChartable: z.boolean().describe("Whether the provided text can be reasonably converted into a chart."),
    chartType: z.enum(['bar', 'line', 'pie']).optional().describe("The most appropriate chart type for the data."),
    title: z.string().optional().describe("A concise, descriptive title for the chart."),
    data: z.array(z.object({
        name: z.string().describe("The label for a data point (e.g., a month, a category name)."),
        value: z.number().describe("The numerical value for a data point."),
    })).optional().describe("The structured data for the chart, with each object representing a point or slice."),
    reasoning: z.string().optional().describe("If isChartable is false, a brief explanation of why the text could not be charted."),
});
export type GenerateChartFromTextOutput = z.infer<typeof GenerateChartFromTextOutputSchema>;


export async function generateChartFromText(
  input: GenerateChartFromTextInput
): Promise<GenerateChartFromTextOutput> {
  return generateChartFromTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateChartFromTextPrompt',
  input: {schema: GenerateChartFromTextInputSchema},
  output: {schema: GenerateChartFromTextOutputSchema},
  prompt: `You are an expert data visualization assistant. Your task is to analyze a piece of text and convert it into structured data suitable for generating a chart.

Follow these rules:
1.  **Analyze Feasibility:** First, determine if the text contains quantifiable data (like numbers, percentages, or dates). If it does, proceed to the next steps.
2.  **Handle Conceptual Text:** If the text does NOT contain clear quantifiable data but instead describes concepts, ideas, or components, try to extract these as distinct items. If you can identify a list of concepts, create a bar chart where each concept is a bar with a value of 1.
3.  **Determine Chart Type:** If the data is quantifiable, decide the best chart type ('bar', 'line', or 'pie').
    - Use 'pie' for compositions of a whole (e.g., percentages that add up to 100).
    - Use 'line' for data over a time series (e.g., sales per month).
    - Use 'bar' for comparing distinct categories.
4.  **Extract Title:** Generate a short, descriptive title for the chart.
5.  **Extract Data:** Convert the data into an array of objects, where each object has a 'name' (string label) and a 'value' (number).
6.  **When to Fail:** If you cannot extract either quantifiable data or a list of distinct concepts, then and only then should you set 'isChartable' to false and provide a clear, user-friendly reason.
7.  **Return JSON:** You must return only a valid JSON object matching the specified output schema.

Here are some examples:
**Example 1 (Quantifiable Data):**
User Text: "Our Q1 sales were: January $5,500, February $7,200, and March $6,800."
Expected JSON Output:
{
  "isChartable": true,
  "chartType": "line",
  "title": "Q1 Sales Performance",
  "data": [
    { "name": "January", "value": 5500 },
    { "name": "February", "value": 7200 },
    { "name": "March", "value": 6800 }
  ]
}

**Example 2 (Conceptual Data):**
User Text: "My new feature idea involves machine learning, predicting user intent, and proactively suggesting actions."
Expected JSON Output:
{
  "isChartable": true,
  "chartType": "bar",
  "title": "New Feature Components",
  "data": [
    { "name": "Machine Learning", "value": 1 },
    { "name": "Predicting User Intent", "value": 1 },
    { "name": "Proactive Actions", "value": 1 }
  ]
}

**Example 3 (Not Chartable):**
User Text: "I feel happy today."
Expected JSON Output:
{
  "isChartable": false,
  "reasoning": "This text expresses a sentiment and does not contain data that can be visualized in a chart."
}

Now, analyze the following text:
---
{{{selectedText}}}
---
`,
});

const generateChartFromTextFlow = ai.defineFlow(
  {
    name: 'generateChartFromTextFlow',
    inputSchema: GenerateChartFromTextInputSchema,
    outputSchema: GenerateChartFromTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
