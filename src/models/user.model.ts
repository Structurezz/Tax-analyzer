export interface User {
    id?: string;
    name: string;
    email: string;
    role: "finance" | "manager" | "admin";
}
