
'use client';

import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';
import type { Project, Task } from '@/types';
import { useMemo } from 'react';

type TaskStatusBreakdownProps = {
  projects: Project[];
}

const chartConfig = {
    count: {
        label: "Tasks"
    },
    Done: { label: 'Done', color: 'hsl(var(--chart-2))' },
    'In Progress': { label: 'In Progress', color: 'hsl(var(--chart-4))' },
    'To-do': { label: 'To-do', color: 'hsl(var(--chart-1))' },
    Backlog: { label: 'Backlog', color: 'hsl(var(--muted))' },
};

const TaskStatusBreakdown = ({ projects }: TaskStatusBreakdownProps) => {

  const taskData = useMemo(() => {
    const statusCounts: { [key in Task['status']]: number } = {
      'Backlog': 0,
      'To-do': 0,
      'In Progress': 0,
      'Done': 0,
    };

    projects.forEach(project => {
      project.tasks.forEach(task => {
        statusCounts[task.status]++;
      });
    });

    return Object.entries(statusCounts)
      .map(([status, count]) => ({
        status: status as Task['status'],
        count,
        fill: chartConfig[status as keyof typeof chartConfig]?.color || 'hsl(var(--muted))',
      }))
      .filter(item => item.count > 0);
  }, [projects]);
  
  if (taskData.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <p className="text-muted-foreground">No task data available.</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col items-center justify-center">
        <ChartContainer config={chartConfig} className="h-[200px] w-full max-w-[250px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
            <Pie data={taskData} dataKey="count" nameKey="status" innerRadius={50} outerRadius={80} strokeWidth={2}>
                {taskData.map((entry) => (
                    <Cell key={`cell-${entry.status}`} fill={entry.fill} />
                ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="status" />} />
          </PieChart>
        </ChartContainer>
    </div>
  );
}

export default TaskStatusBreakdown;
