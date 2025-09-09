
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/auth-context";
import { ThemeSwitcher } from "@/components/settings/theme-switcher";

export default function SettingsPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account and application settings.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>This is how others will see you on the site.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" defaultValue={user?.displayName || ''} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={user?.email || ''} readOnly />
                    </div>
                    <Button>Update Profile</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the app.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label>Theme</Label>
                             <p className="text-sm text-muted-foreground">
                                Select the theme for the application.
                            </p>
                        </div>
                        <ThemeSwitcher />
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Manage your notification preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="project-updates" className="cursor-pointer">Project Updates</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive notifications about task updates and project milestones.
                            </p>
                        </div>
                        <Switch id="project-updates" />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="team-mentions" className="cursor-pointer">Team Mentions</Label>
                            <p className="text-sm text-muted-foreground">
                                Get notified when a team member mentions you in a comment.
                            </p>
                        </div>
                        <Switch id="team-mentions" defaultChecked />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
