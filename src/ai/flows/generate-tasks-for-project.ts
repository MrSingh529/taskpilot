'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a list of tasks for a new project.
 *
 * - generateTasksForProject - A function that takes a project description and returns a list of suggested tasks.
 * - GenerateTasksForProjectInput - The input type for the generateTasksForProject function.
 * - GenerateTasksForProjectOutput - The return type for the generateTasksFor-project function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateTasksForProjectInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('A description of the project for which to generate tasks.'),
});
export type GenerateTasksForProjectInput = z.infer<typeof GenerateTasksForProjectInputSchema>;

const GenerateTasksForProjectOutputSchema = z.object({
  tasks: z.array(
    z.object({
      title: z.string().describe('The title of the task.'),
      priority: z.enum(['Low', 'Medium', 'High']).describe('The priority of the task.'),
    })
  ).describe('A list of generated tasks for the project.'),
});
export type GenerateTasksForProjectOutput = z.infer<typeof GenerateTasksForProjectOutputSchema>;

export async function generateTasksForProject(
  input: GenerateTasksForProjectInput
): Promise<GenerateTasksForProjectOutput> {
  return generateTasksForProjectFlow(input);
}

const generateTasksPrompt = ai.definePrompt({
  name: 'generateTasksPrompt',
  input: { schema: GenerateTasksForProjectInputSchema },
  output: { schema: GenerateTasksForProjectOutputSchema },
  prompt: `You are an expert project manager. Based on the following project description, generate a list of 5-10 initial tasks to help the user get started.

Project Description: {{{projectDescription}}}

Generate tasks that are actionable and cover the main areas of the project. Assign a priority to each task.
`,
});

const generateTasksForProjectFlow = ai.defineFlow(
  {
    name: 'generateTasksForProjectFlow',
    inputSchema: GenerateTasksForProjectInputSchema,
    outputSchema: GenerateTasksForProjectOutputSchema,
  },
  async (input) => {
    const { output } = await generateTasksPrompt(input);
    return output!;
  }
);
