import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../../services/users/users.service';
import { IsAuthenticatedGuard } from 'src/utils/guards/session/IsAuthenticated.guard';
import { ScopeGuard } from 'src/utils/guards/scope/Scope.guard';
import { CustomJwtService } from 'src/modules/auth/services/custom-jwt/custom-jwt.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { CreateUser, User } from 'src/models/types/User';
import { UserRole } from 'src/models/types/UserRole';
import * as request from 'supertest';
import { AdminAccessSerializedUser, PublicAccessSerializedUser } from 'src/utils/serializers/User.serializer';
import { plainToInstance } from 'class-transformer';
import { UserRelatedPermissions } from 'src/models/types/UserPermissions';
import ChangePasswordDto from 'src/models/dtos/users/ChangePassword.dto';

describe('UsersController', () => {
    let controller: UsersController;
    let app: INestApplication;
    let service: UsersService;
    let scopeGuard: ScopeGuard;
    let authGuard: IsAuthenticatedGuard;

    const firstUserToCreate: CreateUser = {
        firstName: 'John',
        lastName: 'Doe',
        profileName: 'john_doe',
        email: 'john@doe.com',
        password: 'password',
        roles: [UserRole.ADMIN],
        permissions: [UserRelatedPermissions.DELETE_USER_ROLE],
    };
    const firstUser: User = {
        id: 1,
        ...firstUserToCreate,
    };
    const secondUser: User = {
        id: 2,
        firstName: 'Ann',
        lastName: 'Doe',
        profileName: 'ann_doe',
        email: 'ann@doe.com',
        password: 'password',
        roles: [UserRole.USER],
        permissions: [],
    };
    const thirdUser: User = {
        id: 3,
        firstName: 'Dan',
        lastName: 'Doe',
        profileName: 'dan_doe',
        email: 'dan@doe.com',
        password: 'password',
        roles: [UserRole.ADMIN],
        permissions: [UserRelatedPermissions.ADD_USER_ROLE],
    };
    const allUsers = [firstUser, secondUser, thirdUser];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: {
                        findAll: jest.fn().mockImplementation(() => Promise.resolve(allUsers)),
                        findById: jest
                            .fn()
                            .mockImplementation((id: number) =>
                                Promise.resolve(allUsers.find((user) => user.id === id)),
                            ),
                        search: jest.fn(),
                        create: jest.fn().mockImplementation((user: CreateUser) =>
                            Promise.resolve({
                                id: 1,
                                ...user,
                            }),
                        ),
                        update: jest.fn(),
                        updatePassword: jest.fn(),
                        remove: jest.fn(),
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
                        verifyToken: jest.fn().mockReturnValue({}),
                        getScopesFromToken: jest.fn().mockReturnValue([]),
                    },
                },
            ],
        }).compile();

        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());

        // Mock logged user
        app.use((req, res, next) => {
            req.user = firstUser;
            next();
        });

        await app.init();

        controller = module.get<UsersController>(UsersController);
        service = module.get<UsersService>(UsersService);
        scopeGuard = module.get<ScopeGuard>(ScopeGuard);
        authGuard = module.get<IsAuthenticatedGuard>(IsAuthenticatedGuard);
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('GET /', () => {
        it('should return all users (with PublicAccessSerializedUser)', async () => {
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            const response = await request(app.getHttpServer()).get(`/users/`).expect(200);

            expect(service.findAll).toHaveBeenCalled();
            expect(response.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining(plainToInstance(PublicAccessSerializedUser, firstUser)),
                    expect.objectContaining(plainToInstance(PublicAccessSerializedUser, secondUser)),
                    expect.objectContaining(plainToInstance(PublicAccessSerializedUser, thirdUser)),
                ]),
            );
        });

        it('should return 403 if user is not authenticated', async () => {
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(false));

            await request(app.getHttpServer()).get(`/users/`).expect(403);
        });
    });

    describe('GET /:id', () => {
        it('should return user with given id (with PublicAccessSerializedUser)', async () => {
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            const response = await request(app.getHttpServer()).get(`/users/1`).expect(200);

            expect(service.findById).toHaveBeenCalledWith(1);
            expect(response.body).toEqual(
                expect.objectContaining(plainToInstance(PublicAccessSerializedUser, firstUser)),
            );
        });

        //Pipe
        it('should return 400 if id is not a number', async () => {
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            await request(app.getHttpServer()).get(`/users/abc`).expect(400);
        });

        // Guard
        it('should return 403 if user is not authenticated', async () => {
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(false));

            await request(app.getHttpServer()).get(`/users/1`).expect(403);
        });
    });

    describe('POST /', () => {
        // service.create returns given user with added id: 1
        it('should create new user', async () => {
            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            const result = await request(app.getHttpServer()).post(`/users/`).send(firstUserToCreate).expect(201);

            expect(service.create).toHaveBeenCalledWith(firstUserToCreate);
            expect(result.body).toEqual(expect.objectContaining(plainToInstance(AdminAccessSerializedUser, firstUser)));
        });

        // Dto
        it('should return 400 if body is not valid', async () => {
            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            await request(app.getHttpServer()).post(`/users/`).send({}).expect(400);
        });

        // Guard
        it('should return 403 if user is not authenticated', async () => {
            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(false));

            await request(app.getHttpServer()).post(`/users/`).send(firstUserToCreate).expect(403);
        });
    });

    describe('PUT /:id', () => {
        it('should update user with given id', async () => {
            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            const updatedValues = {
                firstName: 'Dan',
            }
            jest.spyOn(service, 'update').mockReturnValue(Promise.resolve(Object.assign(secondUser, updatedValues)));
            
            const result = await request(app.getHttpServer())
                .put(`/users/2`)
                .send(updatedValues)
                .expect(200);

            expect(result.body).toEqual(expect.objectContaining(plainToInstance(AdminAccessSerializedUser, secondUser)));
        });

        // Cannot update yourself
        it('should return 400 if somebody is trying to update itself', async () => {
            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));
            
            await request(app.getHttpServer())
                .put(`/users/1`)
                .send({})
                .expect(400);
        });

        // Cannot update user with higher/equal role
        it('should return 400 if somebody is trying to update user with higher (or equal) role', async () => {
            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));
            
            await request(app.getHttpServer())
                .put(`/users/3`)
                .send({})
                .expect(400);
        });

        // Pipe
        it('should return 400 if id is not a number', async () => {
            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            await request(app.getHttpServer()).put(`/users/abc`).send({}).expect(400);
        });

        // Dto
        it('should return 400 if body is not valid', async () => {
            // This endpoint is for not-self data update
            // Cannot update password, roles, permissions
            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            await request(app.getHttpServer())
                .put(`/users/2`)
                .send({
                    password: 'password',
                })
                .expect(400);
        });

        // Guard
        it('should return 403 if user is not authenticated', async () => {
            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(false));

            await request(app.getHttpServer()).put(`/users/2`).send({}).expect(403);
        });
    });

    describe('PATCH /:id/password', () => {
        it('should update password of user with given id', async () => {
            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            const updatedValues : ChangePasswordDto = {
                password: 'newPassword',
                confirmPassword: 'newPassword',
            }

            jest.spyOn(service, 'updatePassword').mockReturnValue(Promise.resolve(true));
            
            await request(app.getHttpServer())
                .patch(`/users/2/password`)
                .send(updatedValues)
                .expect(200);
        });

        // Cannot update yourself
        it('should return 400 if somebody is trying to update itself', async () => {
            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));
            
            await request(app.getHttpServer())
                .patch(`/users/1/password`)
                .send({})
                .expect(400);
        });

        // Cannot update user with higher/equal role
        it('should return 400 if somebody is trying to update password of user with higher (or equal) role', async () => {
            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));
            
            await request(app.getHttpServer())
                .patch(`/users/3/password`)
                .send({})
                .expect(400);
        });

        // Pipe
        it('should return 400 if id is not a number', async () => {
            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            await request(app.getHttpServer()).patch(`/users/abc/password`).send({}).expect(400);
        });

        // Dto
        it('should return 400 if body is not valid', async () => {
            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            await request(app.getHttpServer())
                .patch(`/users/2/password`)
                .send({
                    password: 'password',
                })
                .expect(400);
        });

        // Guard
        it('should return 403 if user is not authenticated', async () => {
            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(false));

            await request(app.getHttpServer()).patch(`/users/2/password`).send({}).expect(403);
        });
    });

    describe('DELETE /:id', () => {
        it('should delete user with given id', async () => {
            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            jest.spyOn(service, 'remove').mockReturnValue(Promise.resolve(true));
            
            await request(app.getHttpServer())
                .delete(`/users/2`)
                .query({ confirm: true })
                .expect(200);
        });

        // Cannot delete yourself
        it('should return 400 if somebody is trying to delete itself', async () => {
            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));
            
            await request(app.getHttpServer())
                .delete(`/users/1`)
                .query({ confirm: true })
                .expect(400);
        });

        // Cannot delete user with higher/equal role
        it('should return 400 if somebody is trying to delete user with higher (or equal) role', async () => {
            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));
            
            await request(app.getHttpServer())
                .delete(`/users/3`)
                .query({ confirm: true })
                .expect(400);
        });

        // Pipe
        it('should return 400 if id is not a number', async () => {
            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            await request(app.getHttpServer()).delete(`/users/abc`).query({ confirm: true }).expect(400);
        });

        // Confirm
        it('should return 400 if confirm is not a boolean or not given', async () => {
            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            await request(app.getHttpServer()).delete(`/users/2`).query({ confirm: 'abc' }).expect(400);
            await request(app.getHttpServer()).delete(`/users/2`).expect(400);
        });

        // Guard
        it('should return 403 if user is not authenticated', async () => {
            jest.spyOn(scopeGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(false));

            await request(app.getHttpServer()).delete(`/users/2`).query({ confirm: true }).expect(403);
        });
    });

    describe('GET /me', () => {
        it('should return logged user (with AdminAccessSerializedUser)', async () => {
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            const response = await request(app.getHttpServer()).get(`/users/me`).expect(200);

            expect(response.body).toEqual(expect.objectContaining(plainToInstance(AdminAccessSerializedUser, firstUser)));
        });

        // Guard
        it('should return 403 if user is not authenticated', async () => {
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(false));

            await request(app.getHttpServer()).get(`/users/me`).expect(403);
        });
    });

    describe('PUT /me', () => {
        it('should update and return updated logged user (with AdminAccessSerializedUser)', async () => {
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            // Only profileName can be updated
            const updatedValues = {
                profileName: 'JohnDoee',
            }
            jest.spyOn(service, 'update').mockReturnValue(Promise.resolve(Object.assign(firstUser, updatedValues)));
            
            const result = await request(app.getHttpServer())
                .put(`/users/me`)
                .send(updatedValues)
                .expect(200);

            expect(result.body).toEqual(expect.objectContaining(plainToInstance(AdminAccessSerializedUser, firstUser)));
        });

        it('should return 400 if body is not valid', async () => {
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            await request(app.getHttpServer()).put(`/users/me`).send({}).expect(400);
        });

        it('should return 403 if user is not authenticated', async () => {
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(false));

            await request(app.getHttpServer()).put(`/users/me`).send({}).expect(403);
        });
    });

    describe('PATCH /me/password', () => {
        it('should update password of logged user', async () => {
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            const updatedValues : ChangePasswordDto = {
                password: 'newPassword',
                confirmPassword: 'newPassword',
            }

            jest.spyOn(service, 'updatePassword').mockReturnValue(Promise.resolve(true));
            
            await request(app.getHttpServer())
                .patch(`/users/me/password`)
                .send(updatedValues)
                .expect(200);
        });

        it('should return 400 if confirm is not provided', async () => {
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            await request(app.getHttpServer())
                .patch(`/users/me/password`)
                .send({})
                .expect(400);
        });

        it('should return 400 if body is not valid', async () => {
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            await request(app.getHttpServer())
                .patch(`/users/me/password`)
                .send({
                    password: 'password',
                })
                .expect(400);
        });

        it('should return 403 if user is not authenticated', async () => {
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(false));

            await request(app.getHttpServer()).patch(`/users/me/password`).send({}).expect(403);
        });
    });

    describe('DELETE /me', () => {
        it('should delete logged user', async () => {
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            jest.spyOn(service, 'remove').mockReturnValue(Promise.resolve(true));
            
            await request(app.getHttpServer())
                .delete(`/users/me`)
                .send({ password: 'password', confirmPassword: 'password' })
                .query({ confirm: true })
                .expect(200);
        });

        it('should return 400 if confirm is not provided', async () => {
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            await request(app.getHttpServer())
                .delete(`/users/me`)
                .send({})
                .expect(400);
        });

        it('should return 403 if confirm is not boolean', async () => {
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(true));

            await request(app.getHttpServer())
                .delete(`/users/me`)
                .query({
                    confirm: 'abc',
                })
                .expect(400);
        });

        it('should return 403 if user is not authenticated', async () => {
            jest.spyOn(authGuard, 'canActivate').mockImplementationOnce(() => Promise.resolve(false));

            await request(app.getHttpServer()).delete(`/users/me`).query({ confirm: true }).expect(403);
        });
    });
});