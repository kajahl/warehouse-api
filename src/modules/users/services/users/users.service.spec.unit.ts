import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { CreateUser, UpdateUser, User } from 'src/models/types/User';
import CustomError, { ErrorCodes } from 'src/utils/errors/Custom.error';
import { UserRole } from 'src/models/types/UserRole';
import { UserRepository } from 'src/models/repositories/user/User.repository';
import { BadRequestException, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import ChangePasswordDto from 'src/models/dtos/users/ChangePassword.dto';
import { PasswordService } from 'src/modules/auth/services/password/password.service';

describe('UsersService', () => {
    let service: UsersService;
    let passwordService: PasswordService;
    let userRepository: UserRepository;

    const createUser: CreateUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@doe.com',
        password: 'password',
        profileName: 'john_doe',
        roles: [UserRole.ADMIN, UserRole.USER],
        permissions: [],
    };
    const createdUser = {
        ...createUser,
        id: 1,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: UserRepository,
                    useValue: {
                        createOne: jest.fn(),
                        findAll: jest.fn(),
                        findById: jest.fn(),
                        updateOne: jest.fn(),
                        updatePassword: jest.fn(),
                        deleteOne: jest.fn(),
                    },
                },
                {
                    provide: PasswordService,
                    useValue: {
                        validatePassword: jest.fn(),
                    }
                }
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        passwordService = module.get<PasswordService>(PasswordService);
        userRepository = module.get<UserRepository>(UserRepository);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create()', () => {
        it('should create a new user', async () => {
            jest.spyOn(passwordService, 'validatePassword').mockReturnValue(true);
            jest.spyOn(userRepository, 'createOne').mockResolvedValue(createdUser);
            expect(await service.create(createUser)).toEqual(createdUser);
        });

        it('should throw conflict exception in duplicate email case', async () => {
            jest.spyOn(passwordService, 'validatePassword').mockReturnValue(true);
            jest.spyOn(userRepository, 'createOne').mockRejectedValue(
                new CustomError(ErrorCodes.DUPLICATE_POSTGRES_ERROR_CODE),
            );
            await expect(service.create(createUser)).rejects.toThrow(ConflictException);
        });
        
        it('should throw bad request exception error exception if password does not meet requirements', async () => {
            jest.spyOn(passwordService, 'validatePassword').mockReturnValue(false);
            await expect(service.create(createUser)).rejects.toThrow(BadRequestException);
        });

        it('should throw internal server error exception if error is unknown', async () => {
            jest.spyOn(passwordService, 'validatePassword').mockReturnValue(true);
            jest.spyOn(userRepository, 'createOne').mockRejectedValue(new Error());
            await expect(service.create(createUser)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('findAll()', () => {
        it('should return all users', async () => {
            jest.spyOn(userRepository, 'findAll').mockResolvedValue([createdUser]);
            expect(await service.findAll()).toEqual([createdUser]);
        });

        it('should throw internal server error exception if error is unknown', async () => {
            jest.spyOn(userRepository, 'findAll').mockRejectedValue(new Error());
            await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('findById()', () => {
        it('should return a user by ID', async () => {
            jest.spyOn(userRepository, 'findById').mockResolvedValue(createdUser);
            expect(await service.findById(createdUser.id)).toEqual(createdUser);
        });

        it('should throw not found exception if user is not found', async () => {
            jest.spyOn(userRepository, 'findById').mockResolvedValue(null);
            await expect(service.findById(createdUser.id)).rejects.toThrow(NotFoundException);
        }); 

        it('should throw internal server error exception if error is unknown', async () => {
            jest.spyOn(userRepository, 'findById').mockRejectedValue(new Error());
            await expect(service.findById(createdUser.id)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('search()', () => {
        it('should throw error', async () => {
            // VIP: This test should be changed after implementing the search method.
            await expect(service.search({})).rejects.toThrow(Error);
        });
    });

    describe('update()', () => {
        it('should update a user by ID', async () => {
            const updatedUser = {
                ...createdUser,
                profileName: 'john_doe_updated',
            }
            jest.spyOn(userRepository, 'updateOne').mockResolvedValue(updatedUser);
            expect(await service.update(createdUser.id, {
                profileName: 'john_doe_updated',
            } as UpdateUser)).toEqual(updatedUser);
        });

        it('should throw BadRequestException if password is defined', async () => {
            jest.spyOn(userRepository, 'updateOne').mockRejectedValue(new CustomError(ErrorCodes.BAD_METHOD));
            await expect(service.update(createdUser.id, {})).rejects.toThrow(BadRequestException);
        });

        it('should throw ConflictException if user with that email already exists', async () => {
            jest.spyOn(userRepository, 'updateOne').mockRejectedValue(new CustomError(ErrorCodes.DUPLICATE_POSTGRES_ERROR_CODE));
            await expect(service.update(createdUser.id, {})).rejects.toThrow(ConflictException);
        });

        it('should throw NotFoundException if user is not found', async () => {
            jest.spyOn(userRepository, 'updateOne').mockRejectedValue(new CustomError(ErrorCodes.NOT_FOUND));
            await expect(service.update(createdUser.id, {})).rejects.toThrow(NotFoundException);
        });

        it('should throw InternalServerErrorException if error is unknown', async () => {
            jest.spyOn(userRepository, 'updateOne').mockRejectedValue(new Error());
            await expect(service.update(createdUser.id, {})).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('updatePassword()', () => {
        const updatePasswordDto : ChangePasswordDto = {
            password: 'password_updated',
            confirmPassword: 'password_updated',
        }

        it('should update a user password by ID', async () => {
            jest.spyOn(passwordService, 'validatePassword').mockReturnValue(true);
            jest.spyOn(userRepository, 'updatePassword').mockResolvedValue({} as any as User);
            expect(await service.updatePassword(createdUser.id, updatePasswordDto)).toEqual(true);
        });

        it('should throw BadRequestException if password does not match the confirm password', async () => {
            const incorrectUpdatePasswordDto : ChangePasswordDto = {
                password: 'password_updated',
                confirmPassword: 'not_matching_password',
            }
            jest.spyOn(passwordService, 'validatePassword').mockReturnValue(true);
            await expect(service.updatePassword(createdUser.id, incorrectUpdatePasswordDto)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if password does not meet the requrements', async () => {
            jest.spyOn(passwordService, 'validatePassword').mockReturnValue(false);
            await expect(service.updatePassword(createdUser.id, updatePasswordDto)).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException if user is not found', async () => {
            jest.spyOn(passwordService, 'validatePassword').mockReturnValue(true);
            jest.spyOn(userRepository, 'updatePassword').mockRejectedValue(new CustomError(ErrorCodes.NOT_FOUND));
            await expect(service.updatePassword(createdUser.id, updatePasswordDto)).rejects.toThrow(NotFoundException);
        });

        it('should throw InternalServerErrorException if error is unknown', async () => {
            jest.spyOn(passwordService, 'validatePassword').mockReturnValue(true);
            jest.spyOn(userRepository, 'updatePassword').mockRejectedValue(new Error());
            await expect(service.updatePassword(createdUser.id, updatePasswordDto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('remove()', () => {
        it('should remove a user by ID', async () => {
            jest.spyOn(userRepository, 'deleteOne').mockResolvedValue(true);
            expect(await service.remove(createdUser.id)).toEqual(true);
        });

        it('should throw NotFoundException if user is not found', async () => {
            jest.spyOn(userRepository, 'deleteOne').mockRejectedValue(new CustomError(ErrorCodes.NOT_FOUND));
            await expect(service.remove(createdUser.id)).rejects.toThrow(NotFoundException);
        });

        it('should throw InternalServerErrorException if error is unknown', async () => {
            jest.spyOn(userRepository, 'deleteOne').mockRejectedValue(new Error());
            await expect(service.remove(createdUser.id)).rejects.toThrow(InternalServerErrorException);
        });
    });
});
