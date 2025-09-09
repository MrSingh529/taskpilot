export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  initials: string;
};

export type Task = {
  id: string;
  title: string;
  status: 'To-do' | 'In Progress' | 'Done' | 'Backlog';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string | null;
  assignee: User | null;
};

export type Activity = {
  id: string;
  text: string;
  timestamp: string;
  user: User;
};

export type Project = {
  id: string;
  name: string;
  owner: User;
  deadline: string;
  completionPercentage: number;
  progressNotes: string;
  tasks: Task[];
  activities: Activity[];
  files: { name: string; type: string; size: string, url: string }[];
};
