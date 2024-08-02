import {
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

@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

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

    @UseGuards(ScopeGuard)
    @UseScopeGuard([{ roles: [UserRole.ADMIN] }, { permissions: [RoleRelatedPermissions.ASSIGN_ROLE] }])
    @Post(':roleName/users/:userId')
    async addUserToRole(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('roleName', new ParseEnumPipe(UserRole)) role: UserRole,
    ) {
        return this.rolesService.addUserToRole(userId, role);
    }

    @UseGuards(ScopeGuard)
    @UseScopeGuard([{ roles: [UserRole.ADMIN] }, { permissions: [RoleRelatedPermissions.REMOVE_ROLE] }])
    @Delete(':roleName/users/:userId')
    async removeUserFromRole(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('roleName', new ParseEnumPipe(UserRole)) role: UserRole,
    ) {
        return this.rolesService.removeUserFromRole(userId, role);
    }
}
