'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a project outline from a project description.
 *
 * The flow takes a project description as input and returns a generated project outline.
 * @file
 * - generateProjectOutline - A function that takes a project description and returns a project outline.
 * - GenerateProjectOutlineInput - The input type for the generateProjectOutline function.
 * - GenerateProjectOutlineOutput - The return type for the generateProjectOutline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProjectOutlineInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('A description of the project for which to generate an outline.'),
});
export type GenerateProjectOutlineInput = z.infer<typeof GenerateProjectOutlineInputSchema>;

const GenerateProjectOutlineOutputSchema = z.object({
  projectOutline: z
    .string()
    .describe('A detailed project outline generated from the project description.'),
});
export type GenerateProjectOutlineOutput = z.infer<typeof GenerateProjectOutlineOutputSchema>;

export async function generateProjectOutline(
  input: GenerateProjectOutlineInput
): Promise<GenerateProjectOutlineOutput> {
  return generateProjectOutlineFlow(input);
}

const generateProjectOutlinePrompt = ai.definePrompt({
  name: 'generateProjectOutlinePrompt',
  input: {schema: GenerateProjectOutlineInputSchema},
  output: {schema: GenerateProjectOutlineOutputSchema},
  prompt: `You are an expert project manager. Generate a detailed project outline based on the following project description:\n\nProject Description: {{{projectDescription}}}\n\nProject Outline: `,
});

const generateProjectOutlineFlow = ai.defineFlow(
  {
    name: 'generateProjectOutlineFlow',
    inputSchema: GenerateProjectOutlineInputSchema,
    outputSchema: GenerateProjectOutlineOutputSchema,
  },
  async input => {
    const {output} = await generateProjectOutlinePrompt(input);
    return output!;
  }
);
