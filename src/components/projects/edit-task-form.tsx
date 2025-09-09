
'use client';

import React, { useState, useMemo } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useToast } from '@/hooks/use-toast';
import type { Task, User, Project } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { updateTask } from '@/services/task-service';
import { Textarea } from '../ui/textarea';
import { useAuth } from '@/context/auth-context';
import { getProjectById } from '@/services/project-service';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  status: z.enum(['Backlog', 'To-do', 'In Progress', 'Done']),
  priority: z.enum(['Low', 'Medium', 'High']),
  dueDate: z.date().nullable(),
  assigneeId: z.string().nullable(),
});

type EditTaskProps = {
  children: React.ReactNode;
  projectId: string;
  task: Task;
  teamMembers: User[];
}

export default function EditTask({ children, projectId, task, teamMembers }: EditTaskProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task.title,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      assigneeId: task.assignee?.id || null,
    }
  });

  const { formState: { isSubmitting } } = form;

  const onSubmit = async (values: z.infer<typeof taskSchema>) => {
     if (!user) {
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'You must be logged in to update a task.',
        });
        return;
    }

    const currentUser: User = {
        id: user.uid,
        name: user.displayName || 'Anonymous',
        avatarUrl: user.photoURL || '',
        initials: user.displayName ? user.displayName.charAt(0) : 'A'
    };

    const assignee = values.assigneeId ? teamMembers.find(m => m.id === values.assigneeId) || null : null;

    try {
        const updatedTask: Task = {
            ...task,
            ...values,
            dueDate: values.dueDate ? values.dueDate.toISOString() : null,
            assignee,
        };
      await updateTask(projectId, updatedTask, currentUser);
      toast({
        title: 'Task updated',
        description: `Task "${values.title}" has been successfully updated.`,
      });
      setOpen(false);
    } catch (error) {
        console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error updating task',
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
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the details of your task.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Implement user login" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Backlog">Backlog</SelectItem>
                                    <SelectItem value="To-do">To-do</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Done">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />
            </div>
            
            <FormField
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Assignee</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? teamMembers.find(
                                (member) => member.id === field.value
                              )?.name
                            : "Select team member"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Search members..." />
                        <CommandEmpty>No member found.</CommandEmpty>
                        <CommandGroup>
                          {teamMembers.map((member) => (
                            <CommandItem
                              value={member.name}
                              key={member.id}
                              onSelect={() => {
                                form.setValue("assigneeId", member.id)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  member.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                               <Avatar className="h-6 w-6 mr-2">
                                  <AvatarImage src={member.avatarUrl} alt={member.name} />
                                  <AvatarFallback>{member.initials}</AvatarFallback>
                               </Avatar>
                              {member.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
