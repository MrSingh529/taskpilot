import ProjectStatusCard from '@/components/dashboard/project-status-card';
import RecentProjects from '@/components/dashboard/recent-projects';
import TaskOverviewChart from '@/components/dashboard/task-overview-chart';
import RecentActivity from '@/components/dashboard/recent-activity';
import { getProjects } from '@/services/project-service';
import { WelcomeHeader } from '@/components/dashboard/welcome-header';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function ProjectStatusSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-8 w-1/3" />
      </CardContent>
    </Card>
  )
}

export default async function DashboardPage() {
  const projects = await getProjects();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <WelcomeHeader />
        <p className="text-muted-foreground">Here's a look at your projects today.</p>
      </div>
      
      <Suspense fallback={
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ProjectStatusSkeleton />
          <ProjectStatusSkeleton />
          <ProjectStatusSkeleton />
        </div>
      }>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0,3).map((project) => (
            <ProjectStatusCard key={project.id} project={project} />
          ))}
           {projects.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center">No projects yet. Create one to get started!</p>
          )}
        </div>
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RecentProjects projects={projects} />
        </div>
        <div className="lg:col-span-3">
            <TaskOverviewChart projects={projects} />
        </div>
      </div>
      
      <div>
        <RecentActivity projects={projects} />
      </div>
    </div>
  );
}
