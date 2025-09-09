import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { Project } from '@/types';
import { format } from 'date-fns';

export default function RecentProjects({ projects }: { projects: Project[] }) {
    
  if (!projects || projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>Your most recently updated projects.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground text-center py-8">No projects found.</p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Projects</CardTitle>
        <CardDescription>Your most recently updated projects.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            {projects.slice(0, 4).map(project => (
                <div key={project.id} className="flex items-center justify-between">
                    <div>
                        <Link href={`/projects/${project.id}`} className="font-semibold hover:underline">{project.name}</Link>
                        <p className="text-sm text-muted-foreground">
                            Due: {format(new Date(project.deadline), 'MMM d, yyyy')}
                        </p>
                    </div>
                    <Button asChild variant="ghost" size="icon">
                        <Link href={`/projects/${project.id}`}><ArrowRight /></Link>
                    </Button>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
