export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    BANNED = 'banned',
}

export enum UserRelatedPermissions {
    CREATE_USER = 'urp_create_user',
    READ_USERS = 'urp_read_users',
    UPDATE_USER = 'urp_update_user',
    DELETE_USER = 'urp_delete_user',
    ADD_USER_ROLE = 'urp_add_user_role',
    DELETE_USER_ROLE = 'urp_delete_user_role',
}

export enum RoleRelatedPermissions {
    CHECK_ROLE_PERMISSIONS = 'rrp_check_role_permissions',
    ASSIGN_ROLE = 'rrp_assign_role',
    REMOVE_ROLE = 'rrp_remove_role',
}

export enum OtherPermissionsPlaceholder {}

export enum DoNotAssignThisPermissionsToRoleOrUser {
    INVALID_FOR_TESTING = 'invalid_for_testing',
}

export type Permissions = 
    UserRelatedPermissions | 
    OtherPermissionsPlaceholder | 
    RoleRelatedPermissions |
    DoNotAssignThisPermissionsToRoleOrUser;

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
