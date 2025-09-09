
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Project } from '@/types';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import EditProject from '../projects/edit-project-form';
import DeleteProjectDialog from '../projects/delete-project-dialog';

type ProjectStatusCardProps = {
  project: Project;
};

export default function ProjectStatusCard({ project }: ProjectStatusCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div className="flex flex-col space-y-1.5">
                <CardTitle className="truncate">{project.name}</CardTitle>
                <CardDescription>
                  Deadline: {format(new Date(project.deadline), 'PPP')}
                </CardDescription>
            </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <EditProject project={project}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Edit Project
                      </DropdownMenuItem>
                    </EditProject>
                    <DeleteProjectDialog projectId={project.id}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                            Delete Project
                        </DropdownMenuItem>
                    </DeleteProjectDialog>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-semibold">{project.completionPercentage}%</span>
        </div>
        <Progress value={project.completionPercentage} aria-label={`${project.completionPercentage}% complete`} />
        <p className="mt-4 text-sm text-muted-foreground line-clamp-2">{project.progressNotes}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center">
            <Avatar className="h-8 w-8">
                <AvatarImage src={project.owner.avatarUrl} alt={project.owner.name} />
                <AvatarFallback>{project.owner.initials}</AvatarFallback>
            </Avatar>
            <span className="ml-2 text-sm font-medium">{project.owner.name}</span>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href={`/projects/${project.id}`}>View</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
