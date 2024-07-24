import { DatabaseId } from "./Database"
import { Permissions, UserRole } from "./UserRole";

export type User = DatabaseId & {
    firstName: string;
    lastName: string;
    profileName: string;
    email: string;
    password: string;
    roles: UserRole[];
    permissions: Permissions[];
}