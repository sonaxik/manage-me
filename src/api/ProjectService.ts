import type { Project } from "../types/Project"

class ProjectService {
    private storageKey = "projects";
    private activeProject = "activeproject";

    getAll(): Project[] {
        const data = localStorage.getItem(this.storageKey);
        if(!data) return []
        else return JSON.parse(data);
    }

    create(name: string, description: string) {
        const data = this.getAll();
        const nowyProjekt: Project = {
            id: crypto.randomUUID(),
            name,
            description
        }
        const nowaListaProjektow = [...data, nowyProjekt];
        localStorage.setItem(this.storageKey, JSON.stringify(nowaListaProjektow));
    }

    update(id: string, name: string, description: string) {
        const data = this.getAll();
        const zaaktualizowanaListaProjektow = data.map(element => {
            if(element.id === id) {
                return {...element, name, description};
            }
            else return element;
        });
        localStorage.setItem(this.storageKey, JSON.stringify(zaaktualizowanaListaProjektow));
    }

    delete(id: string) {
        const data = this.getAll();
        const zaaktualizowanaListaProjektow = data.filter(element => element.id !== id)
        localStorage.setItem(this.storageKey, JSON.stringify(zaaktualizowanaListaProjektow));
    }

    setActiveProject(id: string) {
        localStorage.setItem(this.activeProject, id);
    }

    getActiveProject() {
        const active = localStorage.getItem(this.activeProject);
        if(!active) return null;
        const data = this.getAll().find(element => element.id === active);
        if(!data) return null
        else return data;
    }

    clearActiveProject() {
        localStorage.removeItem(this.activeProject)
    }
}

export const projectService = new ProjectService();