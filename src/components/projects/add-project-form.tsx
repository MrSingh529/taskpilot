'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Sparkles } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { addProject } from '@/services/project-service';
import { useToast } from '@/hooks/use-toast';
import { generateTasksForProject } from '@/ai/flows/generate-tasks-for-project';
import type { Task, User } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/context/auth-context';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Description is required'),
  deadline: z.date({ required_error: 'Deadline is required' }),
});

type AddProjectProps = {
  children: React.ReactNode;
}

export default function AddProject({ children }: AddProjectProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
    }
  });

  const { formState: { isSubmitting } } = form;

  const onSubmit = async (values: z.infer<typeof projectSchema>) => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'You must be logged in to create a project.',
        });
        return;
    }

    const currentUser: User = {
        id: user.uid,
        name: user.displayName || 'Anonymous',
        avatarUrl: user.photoURL || '',
        initials: user.displayName ? user.displayName.charAt(0) : 'A'
    };


    try {
      // Step 1: Show a toast that we are creating the project and generating tasks
      const { dismiss } = toast({
        title: 'Creating Project...',
        description: (
          <div className="flex items-center">
            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
            <span>Hang tight while we generate initial tasks with AI.</span>
          </div>
        ),
      });

      // Step 2: Generate tasks with AI
      const aiResult = await generateTasksForProject({ projectDescription: values.description });
      const generatedTasks: Task[] = aiResult.tasks.map(task => ({
        id: uuidv4(),
        title: task.title,
        priority: task.priority,
        status: 'To-do',
        dueDate: null,
        assignee: null,
      }));

      // Step 3: Create the project with the generated tasks
      await addProject(values, generatedTasks, currentUser);
      
      // Step 4: Update the toast on success
      dismiss();
      toast({
        title: 'Project created successfully!',
        description: `Project "${values.name}" is ready with AI-generated tasks.`,
      });

      setOpen(false);
      form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error creating project',
        description: 'An unexpected error occurred. Please try again.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new project. AI will generate initial tasks for you.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Website Redesign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Briefly describe your project, and AI will create a task list for you..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Deadline</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
