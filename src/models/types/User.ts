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

export type CreateUser = Omit<User, 'id'>;
export type RegisterUser = Omit<User, 'id' | 'roles' | 'permissions'>;
export type UpdateUser = Partial<Omit<User, 'id'>>;