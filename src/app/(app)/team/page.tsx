'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/types";
import InviteMember from '@/components/team/invite-member-form';
import { Button } from '@/components/ui/button';
import { getUsers } from '@/services/user-service';

export default function TeamPage() {
    const [teamMembers, setTeamMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTeamMembers() {
            const users = await getUsers();
            setTeamMembers(users);
            setLoading(false);
        }
        fetchTeamMembers();
    }, [teamMembers]); // Re-fetch when teamMembers state changes to reflect new additions
    
    if (loading) {
        return (
             <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
                    <p className="text-muted-foreground">Manage your team and their roles.</p>
                </div>
                <p>Loading team members...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
                    <p className="text-muted-foreground">Manage your team and their roles.</p>
                </div>
                <InviteMember>
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Member
                    </Button>
                </InviteMember>
            </div>
            <Card>
                <CardContent className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                   {teamMembers.map(member => (
                     <div key={member.id} className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                           <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="person face" />
                           <AvatarFallback>{member.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                           <p className="font-semibold">{member.name}</p>
                           <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                     </div>
                   ))}
                   {teamMembers.length === 0 && !loading && (
                     <p className="text-muted-foreground col-span-full text-center">No team members found.</p>
                   )}
                </CardContent>
            </Card>
        </div>
    );
}
