export enum UserRole {
    ADMIN = 'admin',
    USER = 'user'
}

export enum UserRelatedPermissions {
    CREATE_USER,
    READ_USERS,
    UPDATE_USER,
    DELETE_USER,
    ADD_USER_ROLE,
    DELETE_USER_ROLE,
}

export enum OtherPermissionsPlaceholder {}

export type Permissions = UserRelatedPermissions | OtherPermissionsPlaceholder;

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
    ]
}
