import type { Task, TaskPriority} from "../types/Task";
import { storyService } from './StoryService';

class TaskService {
    private storageKey = "tasks";

    getAll(): Task[] {
        const data = localStorage.getItem(this.storageKey);
        if(!data) return []
        else return JSON.parse(data);
    }

    getByStory(storyId: string): Task[] {
        const data = this.getAll();
        return data.filter(element => element.storyId === storyId);
    }

    create(name: string, description: string, priority: TaskPriority, storyId: string, estimatedHours: number) {
        const data = this.getAll();
        const nowyTask: Task = {
            id: crypto.randomUUID(),
            name,
            description,
            priority,
            storyId,
            estimatedHours,
            status: "todo",
            createdAt: new Date().toISOString(),
            startedAt: null,
            completedAt: null,
            assigneeId: null
        }
        const nowaListaTask = [...data, nowyTask];
        localStorage.setItem(this.storageKey, JSON.stringify(nowaListaTask));
    }

    update(id: string, name: string, description: string, priority: TaskPriority, estimatedHours: number) {
        const data = this.getAll();
        const zaaktualizowanaListaTask = data.map(element => {
            if(element.id === id) {
                return {...element, name, description, priority, estimatedHours};
            }
            else return element;
        });
        localStorage.setItem(this.storageKey, JSON.stringify(zaaktualizowanaListaTask));
    }

    delete(id: string) {
        const data = this.getAll();
        const zaaktualizowanaListaTask = data.filter(element => element.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(zaaktualizowanaListaTask));
    }

    assign(taskId: string, assigneeId: string) {
        const data = this.getAll();
        const task = data.find(element => element.id === taskId);
        if (!task) return;
        const wasToDo = task.status === "todo";
        const zaaktualizowanaListaTask = data.map(element => {
            if(element.id === taskId) {
                return {
                    ...element, 
                    assigneeId,
                    status: wasToDo ? "doing" : element.status,
                    startedAt: wasToDo ? new Date().toISOString() : element.startedAt
                };
            }
            else return element;
        });
        localStorage.setItem(this.storageKey, JSON.stringify(zaaktualizowanaListaTask));
        const story = storyService.getById(task.storyId);
        const storyWasToDo = story?.status === "todo";
        if(storyWasToDo) {
            storyService.updateStatus(story.id, "doing");
        }
    }

    complete(taskId: string) {
        const data = this.getAll();
        const task = data.find(element => element.id === taskId);
        if (!task) return;
        const zaaktualizowanaListaTask = data.map(element => {
            if(element.id === taskId) {
                return {
                    ...element, 
                    status: "done",
                    completedAt: new Date().toISOString()
                };
            }
            else return element;
        });
        localStorage.setItem(this.storageKey, JSON.stringify(zaaktualizowanaListaTask));
        const tasksOfStory = zaaktualizowanaListaTask.filter(element => element.storyId === task.storyId);
        const allDone = tasksOfStory.every(element => element.status === "done");
        if(allDone) {
            storyService.updateStatus(task.storyId, "done");
        }
    }
}

export const taskService = new TaskService();