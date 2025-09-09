import ProjectHeader from '@/components/projects/project-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KanbanView from '@/components/projects/kanban-view';
import GanttView from '@/components/projects/gantt-view';
import TaskList from '@/components/projects/task-list';
import RecentActivity from '@/components/dashboard/recent-activity';
import ProjectFiles from '@/components/projects/project-files';
import { getProjectById } from '@/services/project-service';
import { notFound } from 'next/navigation';

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
    const project = await getProjectById(params.id);

    if (!project) {
        return notFound();
    }

    return (
        <div className="flex flex-col gap-6">
            <ProjectHeader project={project} />

            <Tabs defaultValue="kanban" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
                    <TabsTrigger value="kanban">Kanban</TabsTrigger>
                    <TabsTrigger value="gantt">Gantt</TabsTrigger>
                    <TabsTrigger value="list">List</TabsTrigger>
                    <TabsTrigger value="files">Files</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                <TabsContent value="kanban" className="mt-6">
                    <KanbanView project={project} />
                </TabsContent>
                <TabsContent value="gantt" className="mt-6">
                    <GanttView tasks={project.tasks} />
                </TabsContent>
                <TabsContent value="list" className="mt-6">
                    <TaskList tasks={project.tasks} />
                </TabsContent>
                <TabsContent value="files" className="mt-6">
                    <ProjectFiles files={project.files} projectId={project.id} />
                </TabsContent>
                <TabsContent value="activity" className="mt-6">
                    <RecentActivity projects={[project]} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
