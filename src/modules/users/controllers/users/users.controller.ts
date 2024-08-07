import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
    UseGuards,
    Query,
    ParseBoolPipe,
    BadRequestException,
    UseInterceptors,
    ClassSerializerInterceptor,
} from '@nestjs/common';
import { UsersService } from '../../services/users/users.service';
import CreateUserDto from 'src/models/dtos/users/CreateUser.dto';
import UpdateUserDto from 'src/models/dtos/users/UpdateUser.dto';
import ChangePasswordDto from 'src/models/dtos/users/ChangePassword.dto';
import { IsAuthenticatedGuard } from 'src/utils/guards/session/IsAuthenticated.guard';
import { AdminAccessSerializedUser, PublicAccessSerializedUser } from 'src/utils/serializers/User.serializer';
import { AuthUser } from 'src/utils/decorators/AuthUser.decorator';
import { User, UserWithoutPassword } from 'src/models/types/User';
import { UseScopeGuard } from 'src/utils/decorators/UseScopeGuards.decorator';
import { UserRole } from 'src/models/types/UserRole';
import { UserRelatedPermissions } from 'src/models/types/UserPermissions';
import SelfUpdateUserDto from 'src/models/dtos/users/SelfUpdateUser.dto';
import RolesResolver from 'src/utils/helpers/RolesResolver';
import { ScopeGuard } from 'src/utils/guards/scope/Scope.guard';
import SelfChangePasswordDto from 'src/models/dtos/users/SelfChangePassword.dto';
import { UserExceptionMessages } from 'src/utils/exceptions/messages/User.exceptionMessages';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // Own user
    @Get('me')
    @UseGuards(IsAuthenticatedGuard)
    async findLoggedUser(@AuthUser() user: UserWithoutPassword) {
        return new AdminAccessSerializedUser(user);
    }

    @Put('me')
    @UseGuards(IsAuthenticatedGuard)
    async updateOwnUser(@AuthUser() user: UserWithoutPassword, @Body() body: SelfUpdateUserDto) {
        return this.usersService.update(user.id, body).then((user) => new AdminAccessSerializedUser(user));
    }

    @Patch('me/password')
    @UseGuards(IsAuthenticatedGuard)
    async changeOwnPassword(@AuthUser() user: UserWithoutPassword, @Body() body: SelfChangePasswordDto) {
        // SELF Change Password Dto is required because it requires current password
        return this.usersService.updatePassword(user.id, body);
    }

    @Delete('me')
    @UseGuards(IsAuthenticatedGuard)
    async removeOwnUser(
        @AuthUser() user: User,
        @Body() body: ChangePasswordDto,
        @Query('confirm', new ParseBoolPipe({ optional: true })) confirm: boolean,
    ) {
        if (body.password !== body.confirmPassword)
            throw new BadRequestException(UserExceptionMessages.PASSWORDS_AND_CONFIRMPASSWORD_DOES_NOT_MATCH);
        confirm = confirm ?? false;
        if (!confirm)
            throw new BadRequestException(UserExceptionMessages.MISSING_CONFIRM_QUERY_PARAMETER);
        return this.usersService.remove(user.id);
    }

    // Users
    @Get()
    @UseGuards(IsAuthenticatedGuard)
    async findAll() {
        // return this.usersService.findAll();
        // TODO: If user has permission to read all users data - do not serialize
        return this.usersService.findAll().then((users) => users.map((user) => new PublicAccessSerializedUser(user)));
    }

    @Get(':id')
    @UseGuards(IsAuthenticatedGuard)
    async findOne(@Param('id', new ParseIntPipe({ optional: false })) id: number) {
        // TODO: If user has permission to read all users data - do not serialize
        return this.usersService.findById(id).then((user) => new PublicAccessSerializedUser(user));
    }

    // Management
    @Post()
    @UseGuards(ScopeGuard)
    @UseScopeGuard([{ roles: [UserRole.ADMIN] }, { permissions: [UserRelatedPermissions.CREATE_USER] }])
    async create(@Body() body: CreateUserDto) {
        return this.usersService.create(body).then((user) => new AdminAccessSerializedUser(user));
    }

    @Put(':id')
    @UseGuards(ScopeGuard)
    @UseScopeGuard([{ roles: [UserRole.ADMIN] }, { permissions: [UserRelatedPermissions.UPDATE_USER] }])
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateUserDto,
        @AuthUser() user: UserWithoutPassword,
    ) {
        // Verify if somebody is not trying to update his own data
        if (user.id === id) throw new BadRequestException(UserExceptionMessages.CANNOT_PERFORM_ACTION_ON_YOURSELF_USING_THIS_ENDPOINT);

        // Verify if somebody is not trying to update data of user with more important role
        const userToUpdate = await this.usersService.findById(id);
        if (userToUpdate.roles.length !== 0 && RolesResolver.compareUsersRolesPriority(user, userToUpdate) <= 0)
            throw new BadRequestException(UserExceptionMessages.CANNOT_PERFORM_ACTION_ON_USER_WITH_HIGHER_ROLE);

        return this.usersService.update(id, body).then((user) => new AdminAccessSerializedUser(user));
    }

    @Patch(':id/password')
    @UseGuards(ScopeGuard)
    @UseScopeGuard([{ roles: [UserRole.ADMIN] }, { permissions: [UserRelatedPermissions.UPDATE_USER_PASSWORD] }])
    async changePassword(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: ChangePasswordDto,
        @AuthUser() user: UserWithoutPassword,
    ) {
        // Verify if somebody is not trying to change his own password
        if (user.id === id) throw new BadRequestException(UserExceptionMessages.CANNOT_PERFORM_ACTION_ON_YOURSELF_USING_THIS_ENDPOINT);

        // Verify if somebody is not trying to update password of user with more important role
        const userToUpdate = await this.usersService.findById(id);
        if (userToUpdate.roles.length !== 0 && RolesResolver.compareUsersRolesPriority(user, userToUpdate) <= 0)
            throw new BadRequestException(
                UserExceptionMessages.CANNOT_PERFORM_ACTION_ON_USER_WITH_HIGHER_ROLE,
            );

        return this.usersService.updatePassword(id, body);
    }

    @Delete(':id')
    @UseGuards(ScopeGuard)
    @UseScopeGuard([{ roles: [UserRole.ADMIN] }, { permissions: [UserRelatedPermissions.DELETE_USER] }])
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @Query('confirm', new ParseBoolPipe({ optional: true })) confirm: boolean,
        @AuthUser() user: UserWithoutPassword,
    ) {
        // Verify if somebody is not trying to delete his own account
        if (user.id === id) throw new BadRequestException(UserExceptionMessages.CANNOT_PERFORM_ACTION_ON_YOURSELF_USING_THIS_ENDPOINT);

        // Verify if somebody is not trying to delete user with more important role
        const userToUpdate = await this.usersService.findById(id);
        if (userToUpdate.roles.length !== 0 && RolesResolver.compareUsersRolesPriority(user, userToUpdate) <= 0)
            throw new BadRequestException(UserExceptionMessages.CANNOT_PERFORM_ACTION_ON_USER_WITH_HIGHER_ROLE);

        confirm = confirm ?? false;
        if (!confirm)
            throw new BadRequestException(UserExceptionMessages.MISSING_CONFIRM_QUERY_PARAMETER);
        return this.usersService.remove(id);
    }
}
