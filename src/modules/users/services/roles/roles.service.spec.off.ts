import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { UsersModule } from '../../users.module';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/models/entities/User.entity';
import { UserRole, UserRoleToPermissionsMap } from 'src/models/types/UserRole';
import { DataSource } from 'typeorm';
import { CreateUser } from 'src/models/types/User';
import { UsersService } from '../users/users.service';

describe('RolesService', () => {
    let service: RolesService;
    let usersService: UsersService;
    let dataSource: DataSource;

    const firstUser: CreateUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'UPPERCASE@test.com',
        password: 'password',
        profileName: 'john_doe',
        roles: [UserRole.ADMIN, UserRole.USER],
        permissions: [],
    };
    let firstUserId: number;
    const secondUser: CreateUser = {
        firstName: 'Ann',
        lastName: 'Doe',
        email: 'lowercase@TEST.com',
        password: 'password',
        profileName: 'ann_doe',
        roles: [UserRole.USER],
        permissions: [],
    };
    let secondUserId: number;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: 'postgres',
                    username: 'postgres',
                    password: 'admin',
                    database: 'warehouse_api_test',
                    entities: [UserEntity],
                    synchronize: true,
                }),
                TypeOrmModule.forFeature([UserEntity]),
                UsersModule,
            ],
            providers: [RolesService],
        }).compile();

        service = module.get<RolesService>(RolesService);
        usersService = module.get<UsersService>(UsersService);
        dataSource = module.get<DataSource>(getDataSourceToken());

        await dataSource.synchronize(true); // Reset database before each test

        await usersService.create(firstUser).then((user) => (firstUserId = user.id));
        await usersService.create(secondUser).then((user) => (secondUserId = user.id));
    });

    afterEach(async () => {
        await dataSource.synchronize(true); // Clean database after each test
    });

    afterAll(async () => {
        await dataSource.destroy(); // Close the connection after all tests are done
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAllRoles()', () => {
        it('should return all roles', async () => {
            const roles = await service.findAllRoles(false);
            expect(roles).toEqual(expect.arrayContaining(Object.values(UserRole)));
        });

        it('should return all roles with users', async () => {
            const rolesWithUsers = await service.findAllRoles(true);
            expect(rolesWithUsers).toEqual(
                expect.arrayContaining([
                    {
                        role: UserRole.ADMIN,
                        users: expect.arrayContaining([expect.objectContaining({ id: firstUserId })]),
                    },
                    {
                        role: UserRole.USER,
                        users: expect.arrayContaining([
                            expect.objectContaining({ id: firstUserId }),
                            expect.objectContaining({ id: secondUserId }),
                        ]),
                    },
                ]),
            );
        });
    });

    describe('findUsersWithRole()', () => {
        it('should return all users with a given role', async () => {
            const adminUsers = await service.findUsersWithRole(UserRole.ADMIN);
            expect(adminUsers).toEqual(expect.arrayContaining([expect.objectContaining({ id: firstUserId })]));
            const userUsers = await service.findUsersWithRole(UserRole.USER);
            expect(userUsers).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ id: firstUserId }),
                    expect.objectContaining({ id: secondUserId }),
                ]),
            );
        });

        it('should return an empty array if no users have the given role', async () => {
            const users = await service.findUsersWithRole(UserRole.BANNED);
            expect(users).toEqual([]);
        });
    });

    describe('findRolePermissions()', () => {
        it('should return all permissions for a given role', () => {
            expect(service.findRolePermissions(UserRole.ADMIN)).toEqual(
                expect.arrayContaining(UserRoleToPermissionsMap[UserRole.ADMIN]),
            );
            expect(service.findRolePermissions(UserRole.USER)).toEqual(
                expect.arrayContaining(UserRoleToPermissionsMap[UserRole.USER]),
            );
            expect(service.findRolePermissions(UserRole.BANNED)).toEqual([]);
        });
    });

    describe('checkIfUserHasRole()', () => {
        it('should return true if the user has the role', async () => {
            expect(await service.checkIfUserHasRole(firstUserId, UserRole.ADMIN)).toBe(true);
            expect(await service.checkIfUserHasRole(firstUserId, UserRole.USER)).toBe(true);
            expect(await service.checkIfUserHasRole(secondUserId, UserRole.USER)).toBe(true);
        });

        it('should return false if the user does not have the role', async () => {
            expect(await service.checkIfUserHasRole(firstUserId, UserRole.BANNED)).toBe(false);
            expect(await service.checkIfUserHasRole(secondUserId, UserRole.ADMIN)).toBe(false);
        });
    });

    describe('addUserToRole()', () => {
        it('should add a role to a user', async () => {
            await service.addUserToRole(secondUserId, UserRole.ADMIN);
            const user = await usersService.findById(secondUserId);
            expect(user.roles).toEqual(expect.arrayContaining([UserRole.ADMIN, UserRole.USER]));
        });

        it('should throw an error if the user already has the role', async () => {
            await expect(service.addUserToRole(firstUserId, UserRole.ADMIN)).rejects.toThrowError('User already has this role');
        });
    });

    describe('removeUserFromRole()', () => {
        it('should remove a role from a user', async () => {
            await service.removeUserFromRole(firstUserId, UserRole.USER);
            const user = await usersService.findById(firstUserId);
            expect(user.roles).toEqual([UserRole.ADMIN]);
        });

        it('should throw an error if the user does not have the role', async () => {
            await expect(service.removeUserFromRole(secondUserId, UserRole.ADMIN)).rejects.toThrow();
        });
    });

});
