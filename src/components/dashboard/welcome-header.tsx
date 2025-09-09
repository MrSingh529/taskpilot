'use client';

import { useAuth } from "@/context/auth-context";

export function WelcomeHeader() {
    const { user } = useAuth();
    return (
        <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.displayName?.split(' ')[0] || 'friend'}!
        </h1>
    )
}
