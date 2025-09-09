'use client';

import React, { useState, ChangeEvent } from 'react';
import type { Project } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { File, FileText, FileUp, MoreHorizontal, UploadCloud } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/services/file-service';
import { Input } from '../ui/input';

const FileIcon = ({ type }: { type: string }) => {
    if (type.toLowerCase().includes('pdf')) return <FileText className="h-5 w-5 text-red-600" />;
    if (type.toLowerCase().includes('figma')) return <File className="h-5 w-5 text-purple-600" />;
    if (type.toLowerCase().includes('word') || type.toLowerCase().includes('document')) return <FileText className="h-5 w-5 text-blue-600" />;
    return <File className="h-5 w-5" />;
}

export default function ProjectFiles({ files, projectId }: { files: Project['files'], projectId: string }) {
    const { toast } = useToast();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        toast({
            title: 'Uploading file...',
            description: `Please wait while "${file.name}" is being uploaded.`,
        });

        try {
            await uploadFile(projectId, file);
            toast({
                title: 'Upload successful!',
                description: `"${file.name}" has been added to the project.`,
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Upload failed',
                description: 'Could not upload the file. Please try again.',
            });
        } finally {
            setUploading(false);
            // Reset file input
            if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Project Files</CardTitle>
                        <CardDescription>Manage all documents and assets related to this project.</CardDescription>
                    </div>
                     <div>
                        <Input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={uploading}
                        />
                        <Button onClick={handleUploadClick} disabled={uploading}>
                           {uploading ? (
                                <>
                                    <UploadCloud className="mr-2 h-4 w-4 animate-pulse" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <FileUp className="mr-2 h-4 w-4" />
                                    Upload File
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {files && files.length > 0 ? files.map(file => (
                            <TableRow key={file.name}>
                                <TableCell className="font-medium flex items-center gap-3">
                                    <FileIcon type={file.type} />
                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        {file.name}
                                    </a>
                                </TableCell>
                                <TableCell>{file.type}</TableCell>
                                <TableCell>{file.size}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => window.open(file.url, '_blank')}>Download</DropdownMenuItem>
                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No files uploaded yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
