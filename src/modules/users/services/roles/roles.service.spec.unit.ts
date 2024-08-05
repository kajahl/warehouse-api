import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { UserRole } from 'src/models/types/UserRole';
import { CreateUser } from 'src/models/types/User';
import { UsersService } from '../users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/models/entities/User.entity';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import RolesResolver from 'src/utils/helpers/RolesResolver';

describe('RolesService', () => {
    let service: RolesService;
    let userRepository: Repository<UserEntity>;

    const firstUser: CreateUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'UPPERCASE@test.com',
        password: 'password',
        profileName: 'john_doe',
        roles: [UserRole.ADMIN, UserRole.USER],
        permissions: [],
    };
    const secondUser: CreateUser = {
        firstName: 'Ann',
        lastName: 'Doe',
        email: 'lowercase@TEST.com',
        password: 'password',
        profileName: 'ann_doe',
        roles: [UserRole.USER],
        permissions: [],
    };
    const allUsers = [firstUser, secondUser];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RolesService,
                {
                    provide: UsersService,
                    useValue: {
                        findAll: jest.fn().mockResolvedValue(allUsers),
                        findById: jest.fn().mockImplementation((id: number) => {
                            if (id === 1) return Promise.resolve(firstUser);
                            if (id === 2) return Promise.resolve(secondUser);
                            throw new NotFoundException('User not found');
                        })
                    },
                },
                {
                    provide: getRepositoryToken(UserEntity),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<RolesService>(RolesService);
        userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAllRoles()', () => {
        it('should return all roles without users', async () => {
            const roles = await service.findAllRoles(false);
            expect(roles).toEqual(Object.values(UserRole));
        });

        it('should return all roles with users', async () => {
            const roles = await service.findAllRoles(true);
            expect(roles).toEqual(
                expect.arrayContaining(
                    Object.values(UserRole).map((role) =>
                        expect.objectContaining({
                            role: role,
                            users: expect.arrayContaining(
                                allUsers.filter((user) => user.roles.includes(role)).map((user) => expect.objectContaining({
                                    email: user.email
                                })),
                            ),
                        }),
                    ),
                ),
            );
        });
    });

    describe('findUsersWithRole()', () => {
        it('should return users with the given role', async () => {
            const users = await service.findUsersWithRole(UserRole.USER);
            expect(users).toEqual(expect.arrayContaining([firstUser, secondUser]));
        });

        it('should return an empty array if no users have the given role', async () => {
            const users = await service.findUsersWithRole(UserRole.ADMIN);
            expect(users).toEqual([firstUser]);
        });

        it('should return an empty array if no users have the given role', async () => {
            const users = await service.findUsersWithRole(UserRole.BANNED);
            expect(users).toEqual([]);
        });
    });

    describe('findRolePermissions()', () => {
        it('should return permissions for the given role', () => {
            Object.values(UserRole).forEach((role) => {
                const permissions = service.findRolePermissions(role);
                expect(permissions).toEqual(RolesResolver.getRolePermissions(role));
            });
        });
    });

    describe('checkIfUserHasRole()', () => {
        it('should return true if the user has the role', async () => {
            const hasRole = await service.checkIfUserHasRole(1, UserRole.ADMIN);
            expect(hasRole).toBe(true);
        });

        it('should return false if the user does not have the role', async () => {
            const hasRole = await service.checkIfUserHasRole(2, UserRole.ADMIN);
            expect(hasRole).toBe(false);
        });

        it('should return false if the user does not have the role', async () => {
            await expect(service.checkIfUserHasRole(3, UserRole.BANNED)).rejects.toThrow(NotFoundException);
        });
    });

    describe('addUserToRole()', () => {
        it('should add the role to the user', async () => {
            jest.spyOn(userRepository, 'update').mockResolvedValue({ affected: 1 } as any);
            const result = await service.addUserToRole(2, UserRole.ADMIN);
            expect(result).toBe(true);
        });

        it('should throw an error if the user already has the role', async () => {
            await expect(service.addUserToRole(1, UserRole.ADMIN)).rejects.toThrow(BadRequestException);
        });

        it('should throw an error if the update fails', async () => {
            jest.spyOn(userRepository, 'update').mockResolvedValue({ affected: 0 } as any);
            await expect(service.addUserToRole(2, UserRole.ADMIN)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('removeUserFromRole()', () => {
        it('should remove the role from the user', async () => {
            jest.spyOn(userRepository, 'update').mockResolvedValue({ affected: 1 } as any);
            const result = await service.removeUserFromRole(1, UserRole.ADMIN);
            expect(result).toBe(true);
        });

        it('should throw an error if the user does not have the role', async () => {
            await expect(service.removeUserFromRole(2, UserRole.ADMIN)).rejects.toThrow(BadRequestException);
        });

        it('should throw an error if the update fails', async () => {
            jest.spyOn(userRepository, 'update').mockResolvedValue({ affected: 0 } as any);
            await expect(service.removeUserFromRole(1, UserRole.ADMIN)).rejects.toThrow(InternalServerErrorException);
        });
    });
});
