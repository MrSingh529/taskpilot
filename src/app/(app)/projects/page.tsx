import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import ProjectStatusCard from '@/components/dashboard/project-status-card';
import { getProjects } from '@/services/project-service';
import AddProject from '@/components/projects/add-project-form';

export default async function ProjectsPage() {
    const projects = await getProjects();

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">Manage all your projects in one place.</p>
                </div>
                <AddProject>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Project
                    </Button>
                </AddProject>
            </div>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {projects.map((project) => (
                    <ProjectStatusCard key={project.id} project={project} />
                ))}
                 {projects.length === 0 && (
                    <p className="text-muted-foreground col-span-full text-center mt-8">You have no projects. Click "New Project" to create one.</p>
                  )}
            </div>
        </div>
    );
}
