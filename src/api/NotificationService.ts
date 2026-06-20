import type { Notification, NotificationPriority } from '../types/Notification';

class NotificationService {
    private storageKey = "notifications";

    getAll(): Notification[] {
        const data = localStorage.getItem(this.storageKey);
        if(!data) return [];
        else return JSON.parse(data);
    }

    getForUser(userId: string): Notification[] {
        return this.getAll().filter(element => element.recipientId === userId);
    }

    getUnreadCount(userId: string): number {
        return this.getForUser(userId).filter(element => !element.isRead).length;
    }

    create(title: string, message: string, priority: NotificationPriority, recipientId: string): Notification {
        const data = this.getAll();
        const notification: Notification = {
            id: crypto.randomUUID(),
            title,
            message,
            priority,
            date: new Date().toISOString(),
            isRead: false,
            recipientId,
        };
        const nowaListaNotification = [...data, notification];
        localStorage.setItem(this.storageKey, JSON.stringify(nowaListaNotification));
        return notification;
    }

    markAsRead(id: string) {
        const data = this.getAll();
        const nowaListaNotification = data.map(element => {
            if(element.id === id) return { ...element, isRead: true };
            else return element;
        })
        localStorage.setItem(this.storageKey, JSON.stringify(nowaListaNotification));
    }

    markAllAsRead(userId: string) {
        const data = this.getAll();
        const nowaListaNotification = data.map(element => {
            if(element.recipientId === userId) return { ...element, isRead: true };
            else return element;
        })
        localStorage.setItem(this.storageKey, JSON.stringify(nowaListaNotification));
    }
}

export const notificationService = new NotificationService()