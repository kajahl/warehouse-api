import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from '../../services/roles/roles.service';
import { INestApplication } from '@nestjs/common';
import { UserRole } from 'src/models/types/UserRole';
import * as request from 'supertest';
import { ScopeGuard } from 'src/utils/guards/scope/Scope.guard';
import { CustomJwtService } from 'src/modules/auth/services/custom-jwt/custom-jwt.service';
import { IsAuthenticatedGuard } from 'src/utils/guards/session/IsAuthenticated.guard';

describe('RolesController', () => {
    let app: INestApplication;
    let controller: RolesController;
    let service: RolesService;
    let scopeGuard: ScopeGuard;
    let authGuard: IsAuthenticatedGuard;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RolesController],
            providers: [
                {
                    provide: RolesService,
                    useValue: {
                        findAllRoles: jest.fn(),
                        findUsersWithRole: jest.fn(),
                        findRolePermissions: jest.fn(),
                        checkIfUserHasRole: jest.fn(),
                        addUserToRole: jest.fn(),
                        removeUserFromRole: jest.fn(),
                    },
                },
                {
                    provide: IsAuthenticatedGuard,
                    useValue: {
                        canActivate: jest.fn(),
                    },
                },
                {
                    provide: ScopeGuard,
                    useValue: {
                        canActivate: jest.fn(),
                    },
                },
                {
                    provide: CustomJwtService,
                    useValue: {
                        // Mock implementation of CustomJwtService
                        verifyToken: jest.fn().mockReturnValue({}),
                        getScopesFromToken: jest.fn().mockReturnValue([]),
                    },
                },
            ],
        }).compile();

        app = module.createNestApplication();
        await app.init();

        controller = module.get<RolesController>(RolesController);
        service = module.get<RolesService>(RolesService);
        scopeGuard = module.get<ScopeGuard>(ScopeGuard);
        authGuard = module.get<IsAuthenticatedGuard>(IsAuthenticatedGuard);

    });
    
    afterAll(async () => {
        if(app) {
            await app.close();
        }
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('GET /', () => {
        it('should call rolesService.findAllRoles without provided argument', async () => {
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));
            
            await request(app.getHttpServer())
                .get(`/roles`)
                .expect(200);

            expect(service.findAllRoles).toHaveBeenCalledWith(false);
        });

        it('should return 403 if user is not logged in', async () => {
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(false));
            
            await request(app.getHttpServer())
                .get(`/roles`)
                .expect(403);
        });

        it('should call rolesService.findAllRoles with provided argument (true)', async () => {
            const withUsers = true;
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            await request(app.getHttpServer())
                .get(`/roles?populate=${withUsers}`)
                .expect(200);

            expect(service.findAllRoles).toHaveBeenCalledWith(withUsers);
        });

        it('should call rolesService.findAllRoles with provided argument (false)', async () => {
            const withUsers = false;
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            await request(app.getHttpServer())
                .get(`/roles?populate=${withUsers}`)
                .expect(200);

            expect(service.findAllRoles).toHaveBeenCalledWith(withUsers);
        });
    });

    describe('GET /:roleName/users', () => {
        it('should call rolesService.findUsersWithRole with correct parameters', async () => {
            const roleName = UserRole.ADMIN;
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            await request(app.getHttpServer())
                .get(`/roles/${roleName}/users`)
                .expect(200);

            expect(service.findUsersWithRole).toHaveBeenCalledWith(roleName);
        });

        // Guard
        it('should return 403 if user is not logged in', async () => {
            const roleName = UserRole.ADMIN;
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(false));

            await request(app.getHttpServer())
                .get(`/roles/${roleName}/users`)
                .expect(403);
        });

        // Pipe
        it('should return 400 for invalid roleName', async () => {
            const invalidRoleName = 'INVALID_ROLE';
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            await request(app.getHttpServer())
                .get(`/roles/${invalidRoleName}/users`)
                .expect(400);
        });
    });

    describe('GET /:roleName/permissions', () => {
        it('should call rolesService.findRolePermissions with correct parameters', async () => {
            const roleName = UserRole.ADMIN;

            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));
            await request(app.getHttpServer())
                .get(`/roles/${roleName}/permissions`)
                .expect(200);

            expect(service.findRolePermissions).toHaveBeenCalledWith(roleName);
        });

        // Guard
        it('should return 403 if user does not have the required permissions', async () => {
            const roleName = UserRole.ADMIN;

            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(false));
            await request(app.getHttpServer())
                .get(`/roles/${roleName}/permissions`)
                .expect(403);
        });

        // Pipe
        it('should return 400 for invalid roleName', async () => {
            const invalidRoleName = 'INVALID_ROLE';

            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));
            await request(app.getHttpServer())
                .get(`/roles/${invalidRoleName}/permissions`)
                .expect(400);
        });
    });

    describe('POST /:roleName/users/:userId', () => {
        it('should call rolesService.addUserToRole with correct parameters', async () => {
            const roleName = UserRole.ADMIN;
            const userId = 1;

            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));
            await request(app.getHttpServer())
                .post(`/roles/${roleName}/users/${userId}`)
                .expect(201);

            expect(service.addUserToRole).toHaveBeenCalledWith(userId, roleName);
        });

        // Guard
        it('should return 403 if user does not have the required permissions', async () => {
            const roleName = UserRole.ADMIN;
            const userId = 1;

            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(false));
            await request(app.getHttpServer())
                .post(`/roles/${roleName}/users/${userId}`)
                .expect(403);
        });

        // Pipes
        it('should return 400 for invalid roleName', async () => {
            const invalidRoleName = 'INVALID_ROLE';
            const userId = 1;

            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));
            await request(app.getHttpServer())
                .post(`/roles/${invalidRoleName}/users/${userId}`)
                .expect(400);
        });

        it('should return 400 for invalid userId', async () => {
            const roleName = UserRole.ADMIN;
            const invalidUserId = 'INVALID_USER_ID';

            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));
            await request(app.getHttpServer())
                .post(`/roles/${roleName}/users/${invalidUserId}`)
                .expect(400);
        });
    });

    describe('DELETE /:roleName/users/:userId', () => {
        it('should call rolesService.removeUserFromRole with correct parameters', async () => {
            const roleName = UserRole.ADMIN;
            const userId = 1;

            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));
            await request(app.getHttpServer())
                .delete(`/roles/${roleName}/users/${userId}`)
                .expect(200);

            expect(service.removeUserFromRole).toHaveBeenCalledWith(userId, roleName);
        });

        // Guard
        it('should return 403 if user does not have the required permissions', async () => {
            const roleName = UserRole.ADMIN;
            const userId = 1;

            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(false));
            await request(app.getHttpServer())
                .delete(`/roles/${roleName}/users/${userId}`)
                .expect(403);
        });

        // Pipes
        it('should return 400 for invalid roleName', async () => {
            const invalidRoleName = 'INVALID_ROLE';
            const userId = 1;

            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));
            await request(app.getHttpServer())
                .delete(`/roles/${invalidRoleName}/users/${userId}`)
                .expect(400);
        });

        it('should return 400 for invalid userId', async () => {
            const roleName = UserRole.ADMIN;
            const invalidUserId = 'INVALID_USER_ID';

            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));
            await request(app.getHttpServer())
                .delete(`/roles/${roleName}/users/${invalidUserId}`)
                .expect(400);
        });
    });
});
