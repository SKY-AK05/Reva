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
1.  **Analyze Feasibility:** First, determine if the text contains quantifiable data that can be visualized. If not, set 'isChartable' to false and provide a reason.
2.  **Determine Chart Type:** If the data is chartable, decide the best chart type ('bar', 'line', or 'pie').
    - Use 'pie' for compositions of a whole (e.g., percentages that add up to 100).
    - Use 'line' for data over a time series (e.g., sales per month).
    - Use 'bar' for comparing distinct categories.
3.  **Extract Title:** Generate a short, descriptive title for the chart.
4.  **Extract Data:** Convert the data into an array of objects, where each object has a 'name' (string label) and a 'value' (number).
5.  **Return JSON:** You must return only a valid JSON object matching the specified output schema.

Here is an example:
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
