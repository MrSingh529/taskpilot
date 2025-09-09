
'use client';

import { getProjectById } from '@/services/project-service';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Download, Loader2, Plane } from 'lucide-react';
import type { Task } from '@/types';
import { useEffect, useState, useRef } from 'react';
import type { Project } from '@/types';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ProjectReportPage({ params }: { params: { id: string } }) {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchProject() {
            setLoading(true);
            const projectData = await getProjectById(params.id);
            setProject(projectData);
            setLoading(false);
        }
        fetchProject();
    }, [params.id]);

    const handleDownloadPdf = async () => {
        const input = reportRef.current;
        if (!input || !project) return;
        
        setIsGeneratingPdf(true);

        html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            
            const imgWidth = pdfWidth;
            const imgHeight = imgWidth / ratio;
            
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
              position -= pdfHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
              heightLeft -= pdfHeight;
            }
            
            pdf.save(`${project.name}-report.pdf`);
            setIsGeneratingPdf(false);
        });
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Plane className="h-12 w-12 animate-pulse text-primary" />
            </div>
        )
    }

    if (!project) {
        return notFound();
    }
    
    const taskStatusCounts: { [key in Task['status']]: number } = {
      'Backlog': 0,
      'To-do': 0,
      'In Progress': 0,
      'Done': 0,
    };
    
    project.tasks.forEach(task => {
        taskStatusCounts[task.status]++;
    });

    return (
        <div className="bg-background min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-end mb-4">
                    <Button onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
                        {isGeneratingPdf ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-4 w-4" />
                        )}
                        {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
                    </Button>
                </div>
                <div ref={reportRef} className="space-y-8 p-8 bg-card rounded-lg text-card-foreground">
                    <header className="flex items-center justify-between pb-4 border-b">
                        <div className="flex items-center gap-2">
                           <Plane className="h-8 w-8 text-primary" />
                           <h1 className="text-2xl font-bold">TaskPilot</h1>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-bold">{project.name}</h2>
                            <p className="text-muted-foreground">Project Status Report</p>
                        </div>
                    </header>

                    <main className="space-y-8">
                         <Card>
                            <CardHeader>
                                <CardTitle>Project Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
                                <div><strong>Project Owner:</strong> {project.owner.name}</div>
                                <div><strong>Deadline:</strong> {format(new Date(project.deadline), 'PPP')}</div>
                                <div className="md:col-span-2">
                                    <strong>Description:</strong>
                                    <p className="text-muted-foreground mt-1">{project.progressNotes}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Task Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                                    <p className="text-3xl font-bold">{project.tasks.length}</p>
                                </div>
                                 <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm font-medium text-muted-foreground">Done</p>
                                    <p className="text-3xl font-bold">{taskStatusCounts['Done']}</p>
                                 </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                                    <p className="text-3xl font-bold">{taskStatusCounts['In Progress']}</p>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm font-medium text-muted-foreground">To-do</p>
                                    <p className="text-3xl font-bold">{taskStatusCounts['To-do']}</p>
                                </div>
                            </CardContent>
                        </Card>

                         <Card>
                            <CardHeader>
                                <CardTitle>Task Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Task</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Priority</TableHead>
                                            <TableHead>Assignee</TableHead>
                                            <TableHead>Due Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {project.tasks.map(task => (
                                            <TableRow key={task.id}>
                                                <TableCell className="font-medium">{task.title}</TableCell>
                                                <TableCell><Badge variant="outline">{task.status}</Badge></TableCell>
                                                <TableCell><Badge variant={task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'secondary' : 'outline'} className="capitalize">{task.priority}</Badge></TableCell>
                                                <TableCell>{task.assignee?.name || 'Unassigned'}</TableCell>
                                                <TableCell>{task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'N/A'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </main>
                    <footer className="text-center text-xs text-muted-foreground pt-4 border-t">
                        Report generated on {format(new Date(), 'PPP')}
                    </footer>
                </div>
            </div>
        </div>
    );
}
