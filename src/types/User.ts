export interface User {
    id: string;
    firstName: string;
    lastName: string,
    role: UserRole
}

export type UserRole = "admin" | "devops" | "developer";