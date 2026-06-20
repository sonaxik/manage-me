import type { User } from "../types/User";

class UserService {
    private users: User[] = [
        {id: crypto.randomUUID(), firstName: "Jan", lastName: "Kowalski", role: "admin"},
        {id: crypto.randomUUID(), firstName: "Adam", lastName: "Nowak", role: "devops"},
        {id: crypto.randomUUID(), firstName: "Marcin", lastName: "Stonoga", role: "developer"}
    ];

    private loggedInUser: User = this.users.find(u => u.role === "admin")!;

    getUser() {
        return this.loggedInUser;
    }

    getAll(): User[]{
        return this.users;
    }

    getById(id: string): User | undefined {
        return this.users.find(u => u.id === id);
    }
}

export const userService = new UserService();