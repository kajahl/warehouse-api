import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ScopeGuard } from './scope.guard';
import { CustomJwtService } from 'src/modules/auth/services/custom-jwt/custom-jwt.service';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/models/types/User';
import { UserRole } from 'src/models/types/UserRole';
import { JwtTestScopes } from 'src/models/types/Jwt';
import { DoNotAssignThisPermissionsToRoleOrUser, UserRelatedPermissions } from 'src/models/types/UserPermissions';
import RolesResolver from 'src/utils/helpers/RolesResolver';

function createMockExecutionContext(
    user: Omit<User, 'password'> | undefined = undefined,
    token: string | undefined = undefined,
    handler: any = jest.fn(),
): ExecutionContext {
    return {
        switchToHttp: () => ({
            getRequest: () => ({
                user,
                headers: {
                    authorization: token,
                },
            }),
        }),
        getHandler: () => handler,
    } as unknown as ExecutionContext;
}

describe('ScopeGuard', () => {
    let guard: ScopeGuard;
    let reflector: Reflector;
    let jwtService: CustomJwtService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                Reflector,
                {
                    provide: CustomJwtService,
                    useValue: {
                        getScopesFromToken: jest.fn(),
                        _verifyToken: jest.fn(),
                    },
                },
                ScopeGuard,
            ],
        }).compile();

        reflector = module.get<Reflector>(Reflector);
        jwtService = module.get<CustomJwtService>(CustomJwtService);
        guard = module.get<ScopeGuard>(ScopeGuard);
    });

    // Not provided
    it('should return false: user is not authenticated, token is not provided', async () => {
        const context = createMockExecutionContext(); // User or/and token
        jest.spyOn(reflector, 'get').mockReturnValue(null); // Metadata from decorator

        const result = await guard.canActivate(context);
        expect(result).toBe(false);
    });

    it('should return false: token is provided, but not valid', async () => {
        const context = createMockExecutionContext(undefined, 'Bearer token');
        jest.spyOn(jwtService, '_verifyToken').mockImplementation(() => {
            throw new BadRequestException('Invalid token');
        });

        const result = await guard.canActivate(context);
        expect(result).toBe(false);
    });

    // Provided roles, require roles

    describe('Single access case', () => {
        describe('Provided roles, require roles', () => {
            describe('Single role required', () => {
                it('should return false: user does not have required roles', async () => {
                    const user = { roles: [UserRole.USER], permissions: [] } as User;
                    const context = createMockExecutionContext(user);

                    jest.spyOn(reflector, 'get').mockReturnValue({ roles: [UserRole.ADMIN] });

                    const result = await guard.canActivate(context);
                    expect(result).toBe(false);
                });

                it('should return true: user have required role', async () => {
                    const user = { roles: [UserRole.USER], permissions: [] } as User;
                    const context = createMockExecutionContext(user);

                    jest.spyOn(reflector, 'get').mockReturnValue({ roles: [UserRole.USER] });

                    const result = await guard.canActivate(context);
                    expect(result).toBe(true);
                });
            });

            describe('Multiple roles required', () => {
                it('should return false: user does not have all required roles', async () => {
                    const user = { roles: [UserRole.USER], permissions: [] } as User;
                    const context = createMockExecutionContext(user);

                    jest.spyOn(reflector, 'get').mockReturnValue({ roles: [UserRole.ADMIN, UserRole.USER] });

                    const result = await guard.canActivate(context);
                    expect(result).toBe(false);
                });

                it('should return true: user have all required roles', async () => {
                    const roles = [UserRole.ADMIN, UserRole.USER];
                    const user = { roles, permissions: [] } as User;
                    const context = createMockExecutionContext(user);

                    jest.spyOn(reflector, 'get').mockReturnValue({ roles });

                    const result = await guard.canActivate(context);
                    expect(result).toBe(true);
                });
            });
        });

        // Provided permissions, required permissions

        describe('Provided permissions, required permissions', () => {
            describe('Single permission required', () => {
                it('should return false: user does not have required permissions', async () => {
                    const user = { roles: [], permissions: [UserRelatedPermissions.READ_USERS] } as User;
                    const context = createMockExecutionContext(user);

                    jest.spyOn(reflector, 'get').mockReturnValue({ permissions: [UserRelatedPermissions.CREATE_USER] });

                    const result = await guard.canActivate(context);
                    expect(result).toBe(false);
                });

                it('should return true: user have required permissions', async () => {
                    const user = { roles: [], permissions: [UserRelatedPermissions.READ_USERS] } as User;
                    const context = createMockExecutionContext(user);

                    jest.spyOn(reflector, 'get').mockReturnValue({ permissions: [UserRelatedPermissions.READ_USERS] });

                    const result = await guard.canActivate(context);
                    expect(result).toBe(true);
                });
            });

            describe('Multiple permissions required', () => {
                it('should return false: user does not have all required permissions', async () => {
                    const user = { roles: [], permissions: [UserRelatedPermissions.READ_USERS] } as User;
                    const context = createMockExecutionContext(user);

                    jest.spyOn(reflector, 'get').mockReturnValue({
                        permissions: [UserRelatedPermissions.CREATE_USER, UserRelatedPermissions.READ_USERS],
                    });

                    const result = await guard.canActivate(context);
                    expect(result).toBe(false);
                });

                it('should return true: user have all required permissions', async () => {
                    const permissions = [UserRelatedPermissions.CREATE_USER, UserRelatedPermissions.READ_USERS];
                    const user = { roles: [], permissions } as User;
                    const context = createMockExecutionContext(user);

                    jest.spyOn(reflector, 'get').mockReturnValue({ permissions });

                    const result = await guard.canActivate(context);
                    expect(result).toBe(true);
                });
            });
        });

        // Provided roles, required permission (resolve permissions from role)

        describe('Provided roles, required permission (resolve permissions from role)', () => {
            describe('Single permission required', () => {
                it('should return false: user have role that have required permissions', async () => {
                    const user = { roles: [UserRole.ADMIN], permissions: [] } as User;
                    const context = createMockExecutionContext(user);

                    jest.spyOn(reflector, 'get').mockReturnValue({
                        permissions: [DoNotAssignThisPermissionsToRoleOrUser.INVALID_FOR_TESTING],
                    });

                    const result = await guard.canActivate(context);
                    expect(result).toBe(false);
                });

                it('should return true: user have role that have required permissions', async () => {
                    const user = { roles: [UserRole.ADMIN], permissions: [] } as User;
                    const context = createMockExecutionContext(user);

                    jest.spyOn(reflector, 'get').mockReturnValue({
                        permissions: [RolesResolver.getRolePermissions(UserRole.ADMIN).at(0)],
                    }); // First permission of ADMIN role (could be any/random)

                    const result = await guard.canActivate(context);
                    expect(result).toBe(true);
                });
            });

            describe('Multiple permissions required', () => {
                it('should return false: user does not have all required permissions', async () => {
                    const user = { roles: [UserRole.ADMIN], permissions: [] } as User;
                    const context = createMockExecutionContext(user);

                    jest.spyOn(reflector, 'get').mockReturnValue({
                        permissions: [
                            ...RolesResolver.getRolePermissions(UserRole.ADMIN),
                            DoNotAssignThisPermissionsToRoleOrUser.INVALID_FOR_TESTING,
                        ],
                    });

                    const result = await guard.canActivate(context);
                    expect(result).toBe(false);
                });

                it('should return true: user have all required permissions', async () => {
                    const user = { roles: [UserRole.ADMIN], permissions: [] } as User;
                    const context = createMockExecutionContext(user);

                    jest.spyOn(reflector, 'get').mockReturnValue({ ...RolesResolver.getRolePermissions(UserRole.ADMIN) });

                    const result = await guard.canActivate(context);
                    expect(result).toBe(true);
                });
            });
        });

        describe('Provided token, require Jwt Scope', () => {
            describe('Single scope required', () => {
                it('should return false: user does not have required JWT scope', async () => {
                    const context = createMockExecutionContext(undefined, 'Bearer token');
                    jest.spyOn(jwtService, '_verifyToken').mockImplementation(() => true);
                    jest.spyOn(jwtService, 'getScopesFromToken').mockReturnValue(
                        Promise.resolve([JwtTestScopes.TEST_SCOPE_1]),
                    );

                    jest.spyOn(reflector, 'get').mockReturnValue({ jwt: [JwtTestScopes.TEST_SCOPE_2] });

                    const result = await guard.canActivate(context);
                    expect(result).toBe(false);
                });

                it('should return true: user have required JWT scope', async () => {
                    const context = createMockExecutionContext(undefined, 'Bearer token');
                    jest.spyOn(jwtService, '_verifyToken').mockImplementation(() => true);
                    jest.spyOn(jwtService, 'getScopesFromToken').mockReturnValue(
                        Promise.resolve([JwtTestScopes.TEST_SCOPE_1]),
                    );

                    jest.spyOn(reflector, 'get').mockReturnValue({ jwt: [JwtTestScopes.TEST_SCOPE_1] });

                    const result = await guard.canActivate(context);
                    expect(result).toBe(true);
                });
            });

            describe('Multiple scopes required', () => {
                it('should return false: user does not have all required JWT scopes', async () => {
                    const context = createMockExecutionContext(undefined, 'Bearer token');
                    jest.spyOn(jwtService, '_verifyToken').mockImplementation(() => true);
                    jest.spyOn(jwtService, 'getScopesFromToken').mockReturnValue(
                        Promise.resolve([JwtTestScopes.TEST_SCOPE_1]),
                    );

                    jest.spyOn(reflector, 'get').mockReturnValue({
                        jwt: [JwtTestScopes.TEST_SCOPE_2, JwtTestScopes.TEST_SCOPE_1],
                    });

                    const result = await guard.canActivate(context);
                    expect(result).toBe(false);
                });

                it('should return true: user have all required JWT scopes', async () => {
                    const context = createMockExecutionContext(undefined, 'Bearer token');
                    jest.spyOn(jwtService, '_verifyToken').mockImplementation(() => true);
                    jest.spyOn(jwtService, 'getScopesFromToken').mockReturnValue(
                        Promise.resolve([JwtTestScopes.TEST_SCOPE_1, JwtTestScopes.TEST_SCOPE_2]),
                    );

                    jest.spyOn(reflector, 'get').mockReturnValue({
                        jwt: [JwtTestScopes.TEST_SCOPE_1, JwtTestScopes.TEST_SCOPE_2],
                    });

                    const result = await guard.canActivate(context);
                    expect(result).toBe(true);
                });
            });
        });
    });

    describe('Multiple access case', () => {
        describe('Provided roles, require role set', () => {
            it('should return false: user does not have right role set to access', async () => {
                const onlyUserRoleContext = createMockExecutionContext({
                    roles: [UserRole.USER],
                    permissions: [],
                } as User);
                const onlyAdminRoleContext = createMockExecutionContext({
                    roles: [UserRole.ADMIN],
                    permissions: [],
                } as User);

                jest.spyOn(reflector, 'get').mockReturnValue([
                    { roles: [UserRole.USER, UserRole.ADMIN] },
                    { roles: [UserRole.USER, UserRole.BANNED] },
                ]);

                expect(guard.canActivate(onlyUserRoleContext)).resolves.toBe(false);
                expect(guard.canActivate(onlyAdminRoleContext)).resolves.toBe(false);
            });

            it('should return true: user have at least one right role set to access', async () => {
                const onlyUserRoleContext = createMockExecutionContext({
                    roles: [UserRole.USER],
                    permissions: [],
                } as User);
                const onlyAdminRoleContext = createMockExecutionContext({
                    roles: [UserRole.ADMIN],
                    permissions: [],
                } as User);
                const bothRolesContext = createMockExecutionContext({
                    roles: [UserRole.USER, UserRole.ADMIN],
                    permissions: [],
                } as User);

                jest.spyOn(reflector, 'get').mockReturnValue([{ roles: [UserRole.USER] }, { roles: [UserRole.ADMIN] }]);

                expect(guard.canActivate(onlyUserRoleContext)).resolves.toBe(true);
                expect(guard.canActivate(onlyAdminRoleContext)).resolves.toBe(true);
                expect(guard.canActivate(bothRolesContext)).resolves.toBe(true);
            });
        });

        describe('Provided permissions, require permission set', () => {
            it('should return false: user does not have right permission set to access', async () => {
                const onlyReadUsersContext = createMockExecutionContext({
                    roles: [],
                    permissions: [UserRelatedPermissions.READ_USERS],
                } as User);
                const onlyCreateUserContext = createMockExecutionContext({
                    roles: [],
                    permissions: [UserRelatedPermissions.CREATE_USER],
                } as User);

                jest.spyOn(reflector, 'get').mockReturnValue([
                    { permissions: [UserRelatedPermissions.READ_USERS, UserRelatedPermissions.CREATE_USER] },
                    { permissions: [UserRelatedPermissions.READ_USERS, UserRelatedPermissions.UPDATE_USER] },
                ]);

                expect(guard.canActivate(onlyReadUsersContext)).resolves.toBe(false);
                expect(guard.canActivate(onlyCreateUserContext)).resolves.toBe(false);
            });

            it('should return true: user have at least one right permission set to access', async () => {
                const onlyReadUsersContext = createMockExecutionContext({
                    roles: [],
                    permissions: [UserRelatedPermissions.READ_USERS],
                } as User);
                const onlyCreateUserContext = createMockExecutionContext({
                    roles: [],
                    permissions: [UserRelatedPermissions.CREATE_USER],
                } as User);
                const bothPermissionsContext = createMockExecutionContext({
                    roles: [],
                    permissions: [UserRelatedPermissions.READ_USERS, UserRelatedPermissions.CREATE_USER],
                } as User);

                jest.spyOn(reflector, 'get').mockReturnValue([
                    { permissions: [UserRelatedPermissions.READ_USERS] },
                    { permissions: [UserRelatedPermissions.CREATE_USER] },
                ]);

                expect(guard.canActivate(onlyReadUsersContext)).resolves.toBe(true);
                expect(guard.canActivate(onlyCreateUserContext)).resolves.toBe(true);
                expect(guard.canActivate(bothPermissionsContext)).resolves.toBe(true);
            });
        });

        describe('Provided roles, require permission set (resolve permissions from role)', () => {
            it('should return false: user does not have right permission set to access', async () => {
                const onlyAdminRoleContext = createMockExecutionContext({
                    roles: [UserRole.ADMIN],
                    permissions: [],
                } as User);
                const onlyUserAndAdminRoleContext = createMockExecutionContext({
                    roles: [UserRole.USER, UserRole.ADMIN],
                    permissions: [],
                } as User);

                jest.spyOn(reflector, 'get').mockReturnValue([
                    {
                        permissions: [
                            UserRelatedPermissions.READ_USERS,
                            DoNotAssignThisPermissionsToRoleOrUser.INVALID_FOR_TESTING,
                        ],
                    },
                    {
                        permissions: [
                            UserRelatedPermissions.CREATE_USER,
                            DoNotAssignThisPermissionsToRoleOrUser.INVALID_FOR_TESTING,
                        ],
                    },
                ]);

                expect(guard.canActivate(onlyAdminRoleContext)).resolves.toBe(false);
                expect(guard.canActivate(onlyUserAndAdminRoleContext)).resolves.toBe(false);
            });

            it('should return true: user have right at least one permission set to access', async () => {
                const onlyAdminRoleContext = createMockExecutionContext({
                    roles: [UserRole.ADMIN],
                    permissions: [],
                } as User);

                jest.spyOn(reflector, 'get').mockReturnValue([
                    { permissions: [DoNotAssignThisPermissionsToRoleOrUser.INVALID_FOR_TESTING] },
                    { permissions: [RolesResolver.getRolePermissions(UserRole.ADMIN).at(1)] },
                ]);

                expect(guard.canActivate(onlyAdminRoleContext)).resolves.toBe(true);
            });
        });

        describe('Provided token, require Jwt Scopes', () => {
            it('should return false: user does not have required JWT scope set', async () => {
                const context = createMockExecutionContext(undefined, 'Bearer token');
                jest.spyOn(jwtService, '_verifyToken').mockImplementation(() => true);
                jest.spyOn(jwtService, 'getScopesFromToken').mockReturnValue(
                    Promise.resolve([JwtTestScopes.TEST_SCOPE_1]),
                );

                jest.spyOn(reflector, 'get').mockReturnValue([
                    { jwt: [JwtTestScopes.TEST_SCOPE_1, JwtTestScopes.TEST_SCOPE_2] },
                    { jwt: [JwtTestScopes.TEST_SCOPE_3] },
                ]);

                const result = await guard.canActivate(context);
                expect(result).toBe(false);
            });

            it('should return true: user have at least one required JWT scope set', async () => {
                const context = createMockExecutionContext(undefined, 'Bearer token');
                jest.spyOn(jwtService, '_verifyToken').mockImplementation(() => true);

                jest.spyOn(reflector, 'get').mockReturnValue([
                    { jwt: [JwtTestScopes.TEST_SCOPE_1, JwtTestScopes.TEST_SCOPE_2] },
                    { jwt: [JwtTestScopes.TEST_SCOPE_3] },
                ]);

                jest.spyOn(jwtService, 'getScopesFromToken').mockReturnValueOnce(
                    Promise.resolve([JwtTestScopes.TEST_SCOPE_1, JwtTestScopes.TEST_SCOPE_2]),
                );
                const firstResult = await guard.canActivate(context);
                expect(firstResult).toBe(true);

                jest.spyOn(jwtService, 'getScopesFromToken').mockReturnValueOnce(
                    Promise.resolve([JwtTestScopes.TEST_SCOPE_3]),
                );
                const secondResult = await guard.canActivate(context);
                expect(secondResult).toBe(true);
            });
        });
    });
});
