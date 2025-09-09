import type { Task } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '../ui/checkbox';
import { format } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Card, CardContent } from '../ui/card';

export default function TaskList({ tasks }: { tasks: Task[] }) {
    return (
        <Card>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"><Checkbox /></TableHead>
                            <TableHead>Task</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Assignee</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.map(task => (
                            <TableRow key={task.id}>
                                <TableCell><Checkbox /></TableCell>
                                <TableCell className="font-medium">{task.title}</TableCell>
                                <TableCell><Badge variant="outline">{task.status}</Badge></TableCell>
                                <TableCell><Badge variant={task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'secondary' : 'outline'} className="capitalize">{task.priority}</Badge></TableCell>
                                <TableCell>{task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'N/A'}</TableCell>
                                <TableCell>
                                    {task.assignee ? (
                                        <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={task.assignee.avatarUrl} />
                                            <AvatarFallback>{task.assignee.initials}</AvatarFallback>
                                        </Avatar>
                                        <span className="hidden sm:inline">{task.assignee.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">Unassigned</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                            <DropdownMenuItem>Change Status</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
