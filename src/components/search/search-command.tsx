'use client';

import React, { useState, useEffect } from 'react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { getProjects } from '@/services/project-service';
import { getUsers } from '@/services/user-service';
import type { Project, Task, User } from '@/types';
import { useRouter } from 'next/navigation';
import { FolderKanban, ListTodo, User as UserIcon } from 'lucide-react';

type SearchCommandProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (open) {
            setLoading(true);
            const fetchData = async () => {
                const [projectsData, usersData] = await Promise.all([
                    getProjects(),
                    getUsers(),
                ]);
                setProjects(projectsData);
                setUsers(usersData);
                setLoading(false);
            };
            fetchData();
        }
    }, [open]);

    const runCommand = (command: () => void) => {
        onOpenChange(false);
        command();
    };

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput placeholder="Search for projects, tasks, or members..." />
            <CommandList>
                {loading && <div className="p-4 text-sm text-center">Loading...</div>}
                <CommandEmpty>No results found.</CommandEmpty>
                
                <CommandGroup heading="Projects">
                    {projects.map(project => (
                        <CommandItem
                            key={project.id}
                            value={`project-${project.name}`}
                            onSelect={() => runCommand(() => router.push(`/projects/${project.id}`))}
                        >
                            <FolderKanban className="mr-2 h-4 w-4" />
                            <span>{project.name}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandGroup heading="Tasks">
                    {projects.flatMap(project => project.tasks.map(task => (
                        <CommandItem
                            key={task.id}
                             value={`task-${task.title}`}
                            onSelect={() => runCommand(() => router.push(`/projects/${project.id}`))}
                        >
                            <ListTodo className="mr-2 h-4 w-4" />
                            <span>{task.title}</span>
                            <span className="text-xs text-muted-foreground ml-2">in {project.name}</span>
                        </CommandItem>
                    )))}
                </CommandGroup>

                <CommandGroup heading="Team Members">
                    {users.map(user => (
                        <CommandItem
                            key={user.id}
                            value={`user-${user.name}`}
                            onSelect={() => runCommand(() => router.push('/team'))}
                        >
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>{user.name}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
