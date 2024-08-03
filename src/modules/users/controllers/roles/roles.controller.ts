import {
    BadRequestException,
    Controller,
    Delete,
    Get,
    Param,
    ParseBoolPipe,
    ParseEnumPipe,
    ParseIntPipe,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { RolesService } from '../../services/roles/roles.service';
import { UserRole } from 'src/models/types/UserRole';
import { UseScopeGuard } from 'src/utils/decorators/UseScopeGuards.decorator';
import { ScopeGuard } from 'src/utils/guards/scope/Scope.guard';
import { IsAuthenticatedGuard } from 'src/utils/guards/session/IsAuthenticated.guard';
import { RoleRelatedPermissions } from 'src/models/types/UserPermissions';
import { AuthUser } from 'src/utils/decorators/AuthUser.decorator';
import { User, UserWithoutPassword } from 'src/models/types/User';
import RolesResolver from 'src/utils/helpers/RolesResolver';
import { UsersService } from '../../services/users/users.service';

@Controller('roles')
export class RolesController {
    constructor(
        private readonly rolesService: RolesService,
        private readonly usersService: UsersService,
    ) {}

    // Fetching

    @Get()
    @UseGuards(IsAuthenticatedGuard)
    async fildAllRoles(@Query('populate', new ParseBoolPipe({optional: true})) withUsers: boolean) {
        withUsers = withUsers ?? false
        return this.rolesService.findAllRoles(withUsers);
    }

    @Get(':roleName/users')
    @UseGuards(IsAuthenticatedGuard)
    async findUsersWithRole(@Param('roleName', new ParseEnumPipe(UserRole)) role: UserRole) {
        return this.rolesService.findUsersWithRole(role);
    }

    @Get(':roleName/permissions')
    @UseGuards(ScopeGuard)
    @UseScopeGuard([{ roles: [UserRole.ADMIN] }, { permissions: [RoleRelatedPermissions.CHECK_ROLE_PERMISSIONS] }])
    async findRolePermissions(@Param('roleName', new ParseEnumPipe(UserRole)) role: UserRole) {
        return this.rolesService.findRolePermissions(role);
    }

    // Checking

    // TODO: Consider if this is needed - skip tests for now

    // @Get(':roleName/users/:userId')
    // checkIfUserHasRole(
    //     @Param('userId', ParseIntPipe) userId: number,
    //     @Param('roleName', new ParseEnumPipe(UserRole)) role: UserRole,
    // ) {
    //     return this.rolesService.checkIfUserHasRole(userId, role);
    // }

    // Assigning and removing users from roles
    // TODO: Consider cases if somebody is assigning/removing his own role? (this same with permissions in the future)

    @UseGuards(ScopeGuard)
    @UseScopeGuard([{ roles: [UserRole.ADMIN] }, { permissions: [RoleRelatedPermissions.ASSIGN_ROLE] }])
    @Post(':roleName/users/:userId')
    async addUserToRole(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('roleName', new ParseEnumPipe(UserRole)) role: UserRole,
        @AuthUser() user: UserWithoutPassword,
    ) {
        // Verify if somebody is not trying to assign role higher or equal to his own role
        if(RolesResolver.compareUsersRolesPriority(user, { roles: [role] }) <= 0) 
            throw new BadRequestException('You cannot assign role with higher or equal priority to your own role');

        const userToUpdate = await this.usersService.findById(userId);
        if (userToUpdate.roles.length !== 0 && RolesResolver.compareUsersRolesPriority(user, userToUpdate) <= 0)
            throw new BadRequestException('You cannot add role to user with a higher or equal role than yours');
            

        return this.rolesService.addUserToRole(userId, role);
    }

    @UseGuards(ScopeGuard)
    @UseScopeGuard([{ roles: [UserRole.ADMIN] }, { permissions: [RoleRelatedPermissions.REMOVE_ROLE] }])
    @Delete(':roleName/users/:userId')
    async removeUserFromRole(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('roleName', new ParseEnumPipe(UserRole)) role: UserRole,
        @AuthUser() user: UserWithoutPassword,
    ) {
        
        // Verify if somebody is not trying to assign role higher or equal to his own role
        if(RolesResolver.compareUsersRolesPriority(user, { roles: [role] }) <= 0) 
            throw new BadRequestException('You cannot remove role with higher or equal priority to your own role');

        // Verify if somebody is not trying to remove role from user with more important role
        const userToUpdate = await this.usersService.findById(userId);
        if (userToUpdate.roles.length !== 0 && RolesResolver.compareUsersRolesPriority(user, userToUpdate) <= 0)
            throw new BadRequestException('You cannot remove role from user with a higher or equal role than yours');

        return this.rolesService.removeUserFromRole(userId, role);
    }
}