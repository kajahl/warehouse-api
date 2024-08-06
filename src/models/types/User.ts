import { DatabaseId } from "./Database"
import { SetForbiddenFields } from "./Dtos";
import { Permissions } from "./UserPermissions";
import { UserRole } from "./UserRole";

//User
export type User = DatabaseId & {
    firstName: string;
    lastName: string;
    profileName: string;
    email: string;
    password: string;
    roles: UserRole[];
    permissions: Permissions[];
}

// Create user
export type CreateUser = SetForbiddenFields<User, 'id'>;

// Register user - cannot set roles and permissions
export type RegisterUser = SetForbiddenFields<User, 'id' | 'roles' | 'permissions'>;

// Update user - cannot set password, roles, and permissions
export type UpdateUser = SetForbiddenFields<Partial<User>, 'id' | 'password' | 'roles' | 'permissions'>;

// Self update user - cannot set first name, last name, email, password, roles, and permissions
export type SelfUpdateUser = SetForbiddenFields<Partial<User>, 'id' | 'firstName' | 'lastName' | 'email' | 'password' | 'roles' | 'permissions'>;

// User without password (use in session serialized user)
export type UserWithoutPassword = SetForbiddenFields<User, 'password'>;

// Change pasword
export type ChangePassword = {
    password: string;
    confirmPassword: string;
}

// Self change password - requires current password
export type SelfChangePassword = ChangePassword & {
    currentPassword: string;
}