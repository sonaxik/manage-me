export type NotificationPriority = "low" | "medium" | "high";

export interface Notification {
    id: string,
    title: string,
    message: string,
    date: string,
    priority: NotificationPriority,
    isRead: boolean,
    recipientId: string
}