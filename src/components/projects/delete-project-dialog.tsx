'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { deleteProject } from "@/services/project-service";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteProjectDialogProps = {
    projectId: string;
    children: React.ReactNode;
    onProjectDeleted?: () => void;
};

export default function DeleteProjectDialog({ projectId, children, onProjectDeleted }: DeleteProjectDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteProject(projectId);
            toast({
                title: "Project deleted",
                description: "The project has been successfully deleted.",
            });
            if (onProjectDeleted) {
                onProjectDeleted();
            } else {
                 router.push('/projects');
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error deleting project",
                description: "An unexpected error occurred. Please try again.",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        project and remove all associated data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                        {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
