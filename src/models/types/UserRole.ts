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