import type { Task } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

export default function GanttView({ tasks }: { tasks: Task[] }) {
    if (tasks.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    No tasks to display in Gantt view.
                </CardContent>
            </Card>
        );
    }
    
    // Determine the project's time range from tasks with due dates
    const dates = tasks
        .map(t => t.dueDate ? new Date(t.dueDate).getTime() : 0)
        .filter(d => d > 0);

    const earliestDate = dates.length > 0 ? new Date(Math.min(...dates)) : new Date();
    const latestDate = dates.length > 0 ? new Date(Math.max(...dates)) : new Date();

    const ganttStartDate = new Date(earliestDate);
    ganttStartDate.setDate(ganttStartDate.getDate() - 5); // Add padding

    const ganttEndDate = new Date(latestDate);
    ganttEndDate.setDate(ganttEndDate.getDate() + 5); // Add padding

    const totalDays = (ganttEndDate.getTime() - ganttStartDate.getTime()) / (1000 * 3600 * 24);

    const calculateGanttStyle = (task: Task) => {
        if (!task.dueDate) return { display: 'none' };
        
        const taskDueDate = new Date(task.dueDate);
        // Assume a 5-day duration for viz, ending on the due date
        const taskStartDate = new Date(taskDueDate);
        taskStartDate.setDate(taskDueDate.getDate() - 4); 
        
        const startOffset = (taskStartDate.getTime() - ganttStartDate.getTime()) / (1000 * 3600 * 24);
        const duration = 5; // Fixed duration
        
        if (startOffset < 0 || startOffset > totalDays) return { display: 'none' };

        const marginLeft = `${(startOffset / totalDays) * 100}%`;
        const width = `${(duration / totalDays) * 100}%`;

        return { marginLeft, width };
    }
    
    const tasksWithDueDate = tasks.filter(t => t.dueDate);
    const tasksWithoutDueDate = tasks.filter(t => !t.dueDate);

    return (
        <Card>
            <CardContent className="p-6 space-y-4">
                 <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-4 pb-2 border-b">
                         <div className="col-span-4 sm:col-span-3 font-semibold">Task</div>
                         <div className="col-span-8 sm:col-span-9 font-semibold">Timeline ({ganttStartDate.toLocaleDateString()} - {ganttEndDate.toLocaleDateString()})</div>
                    </div>
                     {tasksWithDueDate.map(task => (
                        <div key={task.id} className="grid grid-cols-12 gap-4 items-center group">
                            <div className="col-span-4 sm:col-span-3">
                                <p className="font-medium truncate">{task.title}</p>
                            </div>
                            <div className="col-span-8 sm:col-span-9 h-8 bg-muted rounded-md relative overflow-hidden">
                                <div className="absolute h-full rounded-md opacity-90 flex items-center px-2" style={{
                                    ...calculateGanttStyle(task),
                                    backgroundColor: 'hsl(var(--primary))'
                                }}>
                                   <span className="text-xs font-semibold text-primary-foreground truncate hidden group-hover:block">{task.title}</span>
                                </div>
                            </div>
                        </div>
                     ))}
                </div>

                {tasksWithoutDueDate.length > 0 && (
                    <div className="mt-6">
                        <h4 className="font-semibold mb-2">Unscheduled Tasks</h4>
                        <ul className="list-disc list-inside text-muted-foreground">
                            {tasksWithoutDueDate.map(task => (
                                <li key={task.id}>{task.title}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
