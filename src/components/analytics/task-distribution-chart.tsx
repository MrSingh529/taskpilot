'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Project } from '@/types';

type TaskDistributionChartProps = {
    projects: Project[];
}

const TaskDistributionChart = ({ projects }: TaskDistributionChartProps) => {

    const chartData = projects.map(project => ({
        name: project.name,
        'To-do': project.tasks.filter(t => t.status === 'To-do').length,
        'In Progress': project.tasks.filter(t => t.status === 'In Progress').length,
        'Done': project.tasks.filter(t => t.status === 'Done').length,
    }));

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="To-do" stackId="a" fill="hsl(var(--chart-1))" />
                    <Bar dataKey="In Progress" stackId="a" fill="hsl(var(--chart-4))" />
                    <Bar dataKey="Done" stackId="a" fill="hsl(var(--chart-2))" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
};

export default TaskDistributionChart;
