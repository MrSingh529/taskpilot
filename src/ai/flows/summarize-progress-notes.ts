// Summarize progress notes into key takeaways.

'use server';

/**
 * @fileOverview Summarizes long progress notes into key takeaways.
 *
 * - summarizeProgressNotes - A function that summarizes the progress notes.
 * - SummarizeProgressNotesInput - The input type for the summarizeProgressNotes function.
 * - SummarizeProgressNotesOutput - The return type for the summarizeProgressNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeProgressNotesInputSchema = z.object({
  progressNotes: z
    .string()
    .describe('The progress notes to be summarized.'),
});
export type SummarizeProgressNotesInput = z.infer<typeof SummarizeProgressNotesInputSchema>;

const SummarizeProgressNotesOutputSchema = z.object({
  summary: z.string().describe('The summarized progress notes.'),
});
export type SummarizeProgressNotesOutput = z.infer<typeof SummarizeProgressNotesOutputSchema>;

export async function summarizeProgressNotes(input: SummarizeProgressNotesInput): Promise<SummarizeProgressNotesOutput> {
  return summarizeProgressNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeProgressNotesPrompt',
  input: {schema: SummarizeProgressNotesInputSchema},
  output: {schema: SummarizeProgressNotesOutputSchema},
  prompt: `Summarize the following progress notes into key takeaways:\n\n{{progressNotes}}`,
});

const summarizeProgressNotesFlow = ai.defineFlow(
  {
    name: 'summarizeProgressNotesFlow',
    inputSchema: SummarizeProgressNotesInputSchema,
    outputSchema: SummarizeProgressNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
