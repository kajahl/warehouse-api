import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserRole, UserRoleToPermissionsMap } from 'src/models/types/UserRole';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/models/entities/User.entity';
import { VERBOSE } from 'src/utils/consts';

@Injectable()
export class RolesService {
    constructor(
        @Inject() private readonly usersService: UsersService,
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>
    ) {}

    /**
     * Returns all roles.
     * @param withUsers - If true, returns roles with users who have them.
     * @returns Array of all roles (with users if withUsers is true).
     */
    async findAllRoles(withUsers: boolean) {
        const roleNames = Object.values(UserRole);
        if (!withUsers) return roleNames;
        const users = await this.usersService.findAll();
        return roleNames.map(role => {
            return {
                role,
                users: users.filter(user => user.roles.includes(role)) //TODO Serialize
            }
        });
    }

    /**
     * Returns all users with a given role.
     * @param role - The role to find users with.
     * @returns Array of all users with the given role.
     */
    async findUsersWithRole(role: UserRole) {
        const users = await this.usersService.findAll(); //TODO Serialize
        return users.filter(user => user.roles.includes(role));
    }

    /**
     * Returns all permissions for a given role.
     * @param role - The role to find permissions for.
     * @returns Array of all permissions for the given role.
     */
    findRolePermissions(role: UserRole) {
        return UserRoleToPermissionsMap[role];
    }

    /**
     * Checks if a user has a role.
     * @param userId Id of the user to check
     * @param role Role to check for
     * @returns true if the user has the role
     */
    async checkIfUserHasRole(userId: number, role: UserRole) {
        const user = await this.usersService.findById(userId);
        return user.roles.includes(role);
    }

    /**
     * Adds a role to a user.
     * @param userId Id of the user to add role to
     * @param role Role to add to the user
     * @returns true if the role was added successfully
     */
    async addUserToRole(userId: number, role: UserRole) {
        const user = await this.usersService.findById(userId);
        // ^ throws BadRequestException if user is not found
        if(user.roles.includes(role)) throw new BadRequestException('User already has this role');
        const result = await this.userRepository.update({ id: userId }, { roles: [...user.roles, role] }).catch((err) => {
            if (VERBOSE) console.warn(err);
            throw new InternalServerErrorException('#TODO_CODE_007');
        });
        // Result.affected - number of affected rows, if user does not exist already throwed BadRequestException
        // it always should be 1
        if (result.affected !== 1) throw new InternalServerErrorException('#TODO_CODE_008');
        return true;
    }

    /**
     * Removes a role from a user.
     * @param userId Id of the user to remove role from
     * @param role Role to remove from the user
     * @returns true if the role was removed successfully
     */
    async removeUserFromRole(userId: number, role: UserRole) {
        const user = await this.usersService.findById(userId);
        // ^ throws BadRequestException if user is not found
        if(!user.roles.includes(role)) throw new BadRequestException('User does not have this role');
        const result = await this.userRepository.update({ id: userId }, { roles: [...user.roles.filter(r => r !== role)] }).catch((err) => {
            if (VERBOSE) console.warn(err);
            throw new InternalServerErrorException('#TODO_CODE_009');
        });
        // Result.affected - number of affected rows, if user does not exist already throwed BadRequestException
        // it always should be 1
        if (result.affected !== 1) throw new InternalServerErrorException('#TODO_CODE_010');
        return true;
    }
}
