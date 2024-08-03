import { Permissions, UserRelatedPermissions } from "./UserPermissions";

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    BANNED = 'banned',
}

export const UserRolePriority : { [key in UserRole]: number } = {
    [UserRole.ADMIN]: 999,
    [UserRole.USER]: 10,
    [UserRole.BANNED]: 0,
}

export const UserRoleToPermissionsMap : { [key in UserRole]: Permissions[] } = {
    [UserRole.ADMIN]: [
        UserRelatedPermissions.CREATE_USER,
        UserRelatedPermissions.READ_USERS,
        UserRelatedPermissions.UPDATE_USER,
        UserRelatedPermissions.DELETE_USER,
        UserRelatedPermissions.ADD_USER_ROLE,
        UserRelatedPermissions.DELETE_USER_ROLE,
    ],
    [UserRole.USER]: [
        UserRelatedPermissions.READ_USERS,
    ],
    [UserRole.BANNED]: [],
}
