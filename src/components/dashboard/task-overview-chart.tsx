'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';
import type { Project, Task } from '@/types';
import { useMemo } from 'react';

type TaskOverviewChartProps = {
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

const TaskOverviewChart = ({ projects }: TaskOverviewChartProps) => {

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

    return [
      { status: 'Done', count: statusCounts['Done'], fill: 'hsl(var(--chart-2))' },
      { status: 'In Progress', count: statusCounts['In Progress'], fill: 'hsl(var(--chart-4))' },
      { status: 'To-do', count: statusCounts['To-do'], fill: 'hsl(var(--chart-1))' },
      { status: 'Backlog', count: statusCounts['Backlog'], fill: 'hsl(var(--muted))' },
    ].filter(item => item.count > 0);
  }, [projects]);
  
  if (taskData.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Task Status Overview</CardTitle>
          <CardDescription>Across all your projects</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">No tasks found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Task Status Overview</CardTitle>
        <CardDescription>Across all your projects</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center pb-6">
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
      </CardContent>
    </Card>
  );
}

export default TaskOverviewChart;
