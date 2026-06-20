export type TaskPriority = "niski" | "sredni" | "wysoki";

export type TaskStatus = "todo" | "doing" | "done";

export interface Task {
    id: string,
    name:string,
    description: string,
    priority: TaskPriority,
    storyId: string,
    estimatedHours: number,
    status: TaskStatus,
    createdAt: string,
    startedAt: string | null,
    completedAt: string | null,
    assigneeId: string | null
}

