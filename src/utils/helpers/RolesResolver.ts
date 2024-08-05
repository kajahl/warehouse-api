import { User } from 'src/models/types/User';
import { Permissions, UserRelatedPermissions } from 'src/models/types/UserPermissions';
import { UserRole, UserRolePriority } from 'src/models/types/UserRole';

export default class RolesResolver {
    private static UserRoleToPermissionsMap: { [key in UserRole]: Permissions[] } = {
        [UserRole.ADMIN]: [
            UserRelatedPermissions.CREATE_USER,
            UserRelatedPermissions.READ_USERS,
            UserRelatedPermissions.UPDATE_USER,
            UserRelatedPermissions.DELETE_USER,
            UserRelatedPermissions.ADD_USER_ROLE,
            UserRelatedPermissions.DELETE_USER_ROLE,
        ],
        [UserRole.USER]: [UserRelatedPermissions.READ_USERS],
        [UserRole.BANNED]: [],
    };

    /**
     * Check if the provided role has the specified permission.
     * @param role Role to check
     * @param permission Permission to check for
     * @returns True if the role has the permission, false otherwise
     * @example
     * const hasPermission = RolesResolver.hasPermission(UserRole.ADMIN, UserRelatedPermissions.CREATE_USER);
     * console.log(hasPermission); // Output: true
     */
    static hasPermission(role: UserRole, permission: Permissions): boolean {
        const permissions = this.UserRoleToPermissionsMap[role];
        return permissions.includes(permission);
    }

    /**
     * Get permissions for the provided role.
     * @param role Role for which permissions should be fetched
     * @returns Array of permissions for the provided role
     */
    static getRolePermissions(role: UserRole): Permissions[] {
        return this.UserRoleToPermissionsMap[role];
    }

    /**
     * Get highest role from the provided roles.
     * @param roles Array of roles
     * @returns Highest role from the provided roles
     * @example
     * // Assuming UserRolePriority is an enum with values:
     * // UserRolePriority.ADMIN = 3
     * // UserRolePriority.MODERATOR = 2
     * // UserRolePriority.USER = 1
     * const result = RolesResolver.getHighestRole([UserRole.ADMIN, UserRole.USER]);
     * console.log(result); // Output: UserRole.ADMIN
     * @example
     * const result = RolesResolver.getHighestRole([UserRole.USER, UserRole.MODERATOR]);
     * console.log(result); // Output: UserRole.MODERATOR
     */
    static getHighestRole(roles: UserRole[]): UserRole {
        const maxPriority = roles.length > 0 ? Math.max(...roles.map((role) => UserRolePriority[role])) : -1;
        if (maxPriority === -1) throw new Error('No roles provided');
        return roles.find((role) => UserRolePriority[role] === maxPriority) as UserRole;
    }

    /**
     * Compare two roles by their priority.
     * @param firstRole First role
     * @param secondRole Second role
     * @returns Difference between the priority of the first and the second role. It will be negative if the first role has lower priority, positive if the first role has higher priority, and 0 if both roles have the same priority.
     * @example
     * // Assuming UserRolePriority is an enum with values:
     * // UserRolePriority.ADMIN = 3, UserRolePriority.USER = 1
     * const result = RolesResolver.compareRolesPriority(UserRole.ADMIN, UserRole.USER);
     * console.log(result); // Output: 2
     * @example
     * const result = RolesResolver.compareRolesPriority(UserRole.USER, UserRole.USER);
     * console.log(result); // Output: 0
     */
    static compareRolesPriority(firstRole: UserRole, secondRole: UserRole): number {
        const firstRolePriority = UserRolePriority[firstRole];
        const secondRolePriority = UserRolePriority[secondRole];
        return firstRolePriority - secondRolePriority;
    }

    /**
     * Compare two users by their highest role priority.
     * @param firstUser First user
     * @param secondUser Second user
     * @returns Difference between the priority of roles. It will be negative if the first role has lower priority, positive if the first role has higher priority, and 0 if both roles have the same priority.
     * @example
     * // Assuming UserRolePriority is an enum with values:
     * // UserRolePriority.ADMIN = 3
     * // UserRolePriority.MODERATOR = 2
     * // UserRolePriority.USER = 1
     * const result = RolesResolver.compareRolesPriority({
     *  ...
     *  roles: [UserRole.MODERATOR, UserRole.ADMIN]
     * }, {
     *  ...
     *  roles: [UserRole.USER]
     * });
     * console.log(result); // Output: 1
     * @example
     * const result = RolesResolver.compareRolesPriority({
     *  ...
     *  roles: [UserRole.ADMIN, UserRole.MODERATOR]
     * }, {
     *  ...
     *  roles: [UserRole.ADMIN, UserRole.USER]
     * });
     * console.log(result); // Output: 0
     */
    static compareUsersRolesPriority(firstUser: Pick<User, 'roles'>, secondUser: Pick<User, 'roles'>): number {
        const firstUserRole = RolesResolver.getHighestRole(firstUser.roles);
        const secondUserRole = RolesResolver.getHighestRole(secondUser.roles);
        return this.compareRolesPriority(firstUserRole, secondUserRole);
    }
}
