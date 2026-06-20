import type { Story, StoryPriority, StoryStatus } from "../types/Story";

class StoryService {
    private storageKey = "stories";

    getAll(): Story[] {
        const data = localStorage.getItem(this.storageKey);
        if(!data) return []
        else return JSON.parse(data);
    }

    getByProject(projectId: string): Story[] {
        const data = this.getAll();
        return data.filter(element => element.projectId === projectId);
    }

    getById(id: string): Story | undefined {
        return this.getAll().find(element => element.id === id);
    }

    create(name: string, description: string, priority: StoryPriority, projectId: string, ownerId: string) {
        const data = this.getAll();
        const nowaHistoryjka: Story = {
            id: crypto.randomUUID(),
            name,
            description,
            priority,
            projectId,
            createdAt: new Date().toISOString(),
            status: "todo",
            ownerId
        }
        const nowaListaHistoryjek = [...data, nowaHistoryjka];
        localStorage.setItem(this.storageKey, JSON.stringify(nowaListaHistoryjek));
    }

    update(id: string, name: string, description: string, priority: StoryPriority) {
        const data = this.getAll();
        const zaaktualizowanaListaHistoryjek = data.map(element => {
            if(element.id === id) {
                return {...element, name, description, priority};
            }
            else return element;
        });
        localStorage.setItem(this.storageKey, JSON.stringify(zaaktualizowanaListaHistoryjek));
    }

    updateStatus(id: string, status: StoryStatus) {
        const data = this.getAll();
        const zaaktualizowanaListaHistoryjek = data.map(element => {
            if(element.id === id) {
                return {...element, status};
            }
            else return element;
        });
        localStorage.setItem(this.storageKey, JSON.stringify(zaaktualizowanaListaHistoryjek));
    }

    delete(id: string) {
        const data = this.getAll();
        const zaaktualizowanaListaHistoryjek = data.filter(element => element.id !== id)
        localStorage.setItem(this.storageKey, JSON.stringify(zaaktualizowanaListaHistoryjek));
    }
    
}

export const storyService = new StoryService();