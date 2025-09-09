

'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Project } from '@/types';
import { MoreHorizontal, Share2, Star, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/auth-context';
import EditProject from './edit-project-form';
import DeleteProjectDialog from './delete-project-dialog';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


function AvatarStack() {
    const { user } = useAuth();
    // In a real app, this would show project members. For now, it shows the current user.
    if (!user) return null;

    return (
        <div className="flex -space-x-2 overflow-hidden">
            <Avatar className="inline-block h-8 w-8 rounded-full border-2 border-background">
                <AvatarImage src={user.photoURL || ''} />
                <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
        </div>
    )
}

export default function ProjectHeader({ project }: { project: Project }) {
    const router = useRouter();
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                <p className="text-muted-foreground">Managed by {project.owner.name}</p>
            </div>
            <div className="flex items-center gap-2">
                <AvatarStack />
                <Button variant="outline">
                    <Star className="mr-2 h-4 w-4" />
                    Star
                </Button>
                <Button variant="outline">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                </Button>
                 <Link href={`/projects/${project.id}/report`} passHref legacyBehavior>
                    <a target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            Report
                        </Button>
                    </a>
                </Link>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <EditProject project={project}>
                             <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit Project</DropdownMenuItem>
                        </EditProject>
                        <DropdownMenuItem>Project Settings</DropdownMenuItem>
                        <DeleteProjectDialog projectId={project.id} onProjectDeleted={() => router.push('/projects')}>
                             <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Delete Project</DropdownMenuItem>
                        </DeleteProjectDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
