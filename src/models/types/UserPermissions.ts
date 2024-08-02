// UsersController endpoints

export enum UserRelatedPermissions {
    CREATE_USER = 'urp_create_user',
    READ_USERS = 'urp_read_users',
    UPDATE_USER = 'urp_update_user',
    UPDATE_USER_PASSWORD = 'urp_update_user_password',
    DELETE_USER = 'urp_delete_user',
    ADD_USER_ROLE = 'urp_add_user_role',
    DELETE_USER_ROLE = 'urp_delete_user_role',
}
 
// RolesController endpoints
export enum RoleRelatedPermissions {
    CHECK_ROLE_PERMISSIONS = 'rrp_check_role_permissions',
    ASSIGN_ROLE = 'rrp_assign_role',
    REMOVE_ROLE = 'rrp_remove_role',
}

// Placeholder for other permissions
export enum OtherPermissionsPlaceholder {}

// Placeholder for testing purposes
export enum DoNotAssignThisPermissionsToRoleOrUser {
    INVALID_FOR_TESTING = 'invalid_for_testing',
}

// Permissions are a union of all the above enums
export type Permissions = 
    UserRelatedPermissions | 
    OtherPermissionsPlaceholder | 
    RoleRelatedPermissions |
    DoNotAssignThisPermissionsToRoleOrUser;
