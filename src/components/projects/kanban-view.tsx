
'use client';

import React, { useState, useMemo } from 'react';
import type { Task, User, Project } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import AddTask from './add-task-form';
import EditTask from './edit-task-form';
import { DndContext, useDraggable, useDroppable, type DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { updateTask } from '@/services/task-service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

type KanbanViewProps = {
    project: Project;
}

const SortableTaskCard = ({ task, projectId, teamMembers }: { task: Task, projectId: string, teamMembers: User[] }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <EditTask task={task} projectId={projectId} teamMembers={teamMembers}>
                <Card className="mb-4 bg-card hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                        <p className="font-semibold text-sm mb-2">{task.title}</p>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                                {task.dueDate && <span>{format(new Date(task.dueDate), 'MMM d')}</span>}
                                <Badge variant={task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'secondary' : 'outline'} className="capitalize">{task.priority}</Badge>
                            </div>
                            {task.assignee && (
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.name} />
                                    <AvatarFallback>{task.assignee.initials}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </EditTask>
        </div>
    );
};

const KanbanColumn = ({ status, tasks, projectId, teamMembers }: { status: Task['status'], tasks: Task[], projectId: string, teamMembers: User[] }) => {
    const { setNodeRef } = useDroppable({ id: status });
    const taskIds = tasks.map(t => t.id);

    return (
        <div ref={setNodeRef} className="bg-muted/50 rounded-lg p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">{status}</h3>
                <AddTask projectId={projectId} status={status} teamMembers={teamMembers}>
                    <Button variant="ghost" size="icon">
                        <Plus className="h-4 w-4" />
                    </Button>
                </AddTask>
            </div>
            <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col flex-1 min-h-[100px]">
                    {tasks.map(task => <SortableTaskCard key={task.id} task={task} projectId={projectId} teamMembers={teamMembers} />)}
                </div>
            </SortableContext>
        </div>
    )
}

export default function KanbanView({ project }: KanbanViewProps) {
    const columns: Task['status'][] = ['Backlog', 'To-do', 'In Progress', 'Done'];
    const { toast } = useToast();
    const { user } = useAuth();
    const tasks = project.tasks;
    const projectId = project.id;

    const teamMembers = useMemo(() => {
        const membersMap = new Map<string, User>();
        if (project.owner) {
            membersMap.set(project.owner.id, project.owner);
        }
        project.tasks.forEach(task => {
            if (task.assignee) {
                membersMap.set(task.assignee.id, task.assignee);
            }
        });
        return Array.from(membersMap.values());
    }, [project]);


    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const activeTask = tasks.find(t => t.id === active.id);
            // over.id is the column status
            const newStatus = columns.find(c => c === over.id);

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

            if (activeTask && newStatus && activeTask.status !== newStatus) {
                const updatedTask = { ...activeTask, status: newStatus };
                try {
                    await updateTask(projectId, updatedTask, currentUser);
                    toast({
                        title: 'Task Updated',
                        description: `Task "${updatedTask.title}" moved to ${newStatus}.`
                    });
                } catch (error) {
                    toast({
                        variant: 'destructive',
                        title: 'Update Failed',
                        description: 'Could not update task status. Please try again.',
                    });
                }
            }
        }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {columns.map(status => (
                    <KanbanColumn
                        key={status}
                        status={status}
                        tasks={tasks.filter(task => task.status === status)}
                        projectId={projectId}
                        teamMembers={teamMembers}
                    />
                ))}
            </div>
        </DndContext>
    );
}
