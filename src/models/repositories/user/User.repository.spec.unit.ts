import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from './User.repository';
import { UserEntity } from 'src/models/entities/User.entity';
import { PasswordService } from 'src/modules/auth/services/password/password.service';
import { CreateUser, User } from 'src/models/types/User';
import { UserRole } from 'src/models/types/UserRole';
import CustomError, { ErrorCodes } from 'src/utils/errors/Custom.error';

describe('UserRepository', () => {
    let repository: UserRepository;

    const mockUserId = 1;
    const user : CreateUser = {
        firstName: 'John',
        lastName: 'Doe',
        profileName: 'john_doe',
        email: 'john@doe.com',
        password: 'password',
        roles: [UserRole.USER],
        permissions: [],
    };
    const createdUser : User = { id: mockUserId, ...user };

    const repoSaveUserSuccess = jest
        .fn()
        .mockImplementation((user) => Promise.resolve({ id: mockUserId, ...user }));
    const repoSaveUserFailDuplicationError = jest.fn().mockRejectedValue({ code: '23505' });
    const otherError = Error;
    const repoSaveUserFailOtherError = jest.fn().mockRejectedValue(new otherError());

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserRepository,
                {
                    provide: getRepositoryToken(UserEntity),
                    useClass: Repository,
                },
                {
                    provide: PasswordService,
                    useValue: {
                        hashPassword: jest.fn().mockImplementation((password: string) => password),
                    },
                },
            ],
        }).compile();

        repository = module.get<UserRepository>(UserRepository);
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('findAll()', () => {
        it('should return an array of users', async () => {
            jest.spyOn(repository, 'find').mockResolvedValue([]);
            await expect(repository.findAll()).resolves.toEqual([]);
        });

        it('should return an array of users', async () => {
            jest.spyOn(repository, 'find').mockResolvedValue([{}, {}, {}] as any[]);
            await expect(repository.findAll()).resolves.toHaveLength(3);
        });
    });

    describe('findById()', () => {
        it('should return a user by ID', async () => {
            jest.spyOn(repository, 'findOneBy').mockResolvedValue(createdUser);
            await expect(repository.findById(mockUserId)).resolves.toEqual(expect.objectContaining(createdUser));
        });

        it('should return null if no user is found', async () => {
            jest.spyOn(repository, 'findOneBy').mockRejectedValue(new Error());
            await expect(repository.findById(mockUserId)).resolves.toBeNull();
        });
    });

    describe('findByEmail()', () => {
        it('should return a user by email', async () => {
            const user = { email: 'any@email.com' };
            jest.spyOn(repository, 'findOneBy').mockResolvedValue(createdUser);
            await expect(repository.findByEmail(user.email)).resolves.toEqual(expect.objectContaining(createdUser));
        });

        it('should return null if no user is found', async () => {
            jest.spyOn(repository, 'findOneBy').mockRejectedValue(new Error());
            await expect(repository.findByEmail('any')).resolves.toBeNull();
        });
    });

    describe('createOne()', () => {
        it('should create a new user (with email lowercase transform)', async () => {
            jest.spyOn(repository, 'save').mockImplementation(repoSaveUserSuccess);
            jest.spyOn(repository, 'create').mockImplementation((u) => u as any);

            const nowCreatedUser = await repository.createOne({
                ...user,
                email: user.email.toUpperCase(),
            });

            expect(nowCreatedUser).toEqual(
                expect.objectContaining({
                    ...createdUser,
                    email: user.email.toLowerCase(),
                }),
            );
        });

        it('should throw an error if the user with that email already exists', async () => {
            jest.spyOn(repository, 'save').mockImplementation(repoSaveUserFailDuplicationError);
            jest.spyOn(repository, 'create').mockImplementation((u) => u as any);

            try {
                await repository.createOne(user);
                fail();
            } catch (error) {
                expect(error).toBeInstanceOf(CustomError);
                expect(error.code).toBe(ErrorCodes.DUPLICATE_POSTGRES_ERROR_CODE);
            }
        });

        it('should throw an error if any other error occurs', async () => {
            jest.spyOn(repository, 'save').mockImplementation(repoSaveUserFailOtherError);
            jest.spyOn(repository, 'create').mockImplementation((u) => {
                return { id: mockUserId, ...u } as any;
            });

            await expect(repository.createOne(user)).rejects.toThrow(otherError);
        });
    });

    describe('updateOne()', () => {
        it('should update a user', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(createdUser);
            jest.spyOn(repository, 'save').mockImplementation(repoSaveUserSuccess);

            const updateUser : Partial<User> = { firstName: 'Jane' };
            const updatedUser = await repository.updateOne(mockUserId, updateUser);
            expect(updatedUser).toEqual(expect.objectContaining({ ...createdUser, ...updateUser }));
        });

        it('should throw an error if the user is not found', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(null);

            try {
                await repository.updateOne(mockUserId, {});
                fail();
            } catch (error) {
                expect(error).toBeInstanceOf(CustomError);
                expect(error.code).toBe(ErrorCodes.NOT_FOUND);
            }
        });

        it('should throw an error if password is included in the update data', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(createdUser);

            try {
                await repository.updateOne(mockUserId, { password: 'newPassword' });
                fail();
            } catch (error) {
                expect(error).toBeInstanceOf(CustomError);
                expect(error.code).toBe(ErrorCodes.BAD_METHOD);
            }
        });

        it('should throw an error if the user with that email already exists', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(createdUser);
            jest.spyOn(repository, 'save').mockImplementation(repoSaveUserFailDuplicationError);

            try {
                await repository.updateOne(mockUserId, {});
                fail();
            } catch (error) {
                expect(error).toBeInstanceOf(CustomError);
                expect(error.code).toBe(ErrorCodes.DUPLICATE_POSTGRES_ERROR_CODE);
            }
        });

        it('should throw an error if any other error occurs', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(createdUser);
            jest.spyOn(repository, 'save').mockImplementation(repoSaveUserFailOtherError);

            await expect(repository.updateOne(mockUserId, {})).rejects.toThrow(otherError);
        });
    });

    describe('updatePassword()', () => {
        it('should update a user password', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(createdUser);
            jest.spyOn(repository, 'save').mockImplementation(repoSaveUserSuccess);

            const newPassword = 'newPassword';
            const updatedUser = await repository.updatePassword(mockUserId, newPassword);
            expect(updatedUser.password).toBe(newPassword);
        });

        it('should throw an error if the user is not found', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(null);

            try {
                await repository.updatePassword(mockUserId, 'newPassword');
                fail();
            } catch (error) {
                expect(error).toBeInstanceOf(CustomError);
                expect(error.code).toBe(ErrorCodes.NOT_FOUND);
            }
        });
    });

    describe('deleteOne()', () => {
        it('should delete a user', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(createdUser);
            jest.spyOn(repository, 'delete').mockResolvedValue(undefined);

            await expect(repository.deleteOne(mockUserId)).resolves.toBe(true);
        });

        it('should throw an error if the user is not found', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(null);

            try {
                await repository.deleteOne(mockUserId);
                fail();
            } catch (error) {
                expect(error).toBeInstanceOf(CustomError);
                expect(error.code).toBe(ErrorCodes.NOT_FOUND);
            }
        });
    });
});
