import { Controller, Delete, Get, Param, ParseEnumPipe, ParseIntPipe, Post, Query } from '@nestjs/common';
import { RolesService } from '../../services/roles/roles.service';
import { UserRole } from 'src/models/types/UserRole';

@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    // Fetching

    @Get()
    async fildAllRoles(@Query('populate') withUsers: boolean) {
        return this.rolesService.findAllRoles(withUsers);
    }

    @Get(':roleName/users')
    async findUsersWithRole(
        @Param('roleName', new ParseEnumPipe(UserRole)) role: UserRole,
    ) {
        return this.rolesService.findUsersWithRole(role);
    }

    @Get(':roleName/permissions')
    async findRolePermissions(
        @Param('roleName', new ParseEnumPipe(UserRole)) role: UserRole,
    ) {
        return this.rolesService.findRolePermissions(role);
    }

    // Checking

    @Get(':roleName/users/:userId')
    checkIfUserHasRole(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('roleName', new ParseEnumPipe(UserRole)) role: UserRole,
    ) {
        return this.rolesService.checkIfUserHasRole(userId, role);
    }

    // Assigning and removing users from roles

    @Post(':roleName/users/:userId')
    async addUserToRole(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('roleName', new ParseEnumPipe(UserRole)) role: UserRole,
    ) {
        return this.rolesService.addUserToRole(userId, role);
    }

    @Delete(':roleName/users/:userId')
    async removeUserFromRole(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('roleName', new ParseEnumPipe(UserRole)) role: UserRole,
    ) {
        return this.rolesService.removeUserFromRole(userId, role);
    }
}
