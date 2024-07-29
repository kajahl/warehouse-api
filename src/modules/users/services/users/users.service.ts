import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { CreateUser, UpdateUser } from 'src/models/types/User';
import ChangePasswordDto from 'src/models/dtos/users/ChangePassword.dto';
import { VERBOSE } from 'src/utils/consts';
import { UserRepository } from 'src/models/repositories/User.repository';
import CustomError, { ErrorCodes } from 'src/utils/errors/Custom.error';

@Injectable()
export class UsersService {
    constructor(@Inject() private userRepository: UserRepository) {}

    private readonly DUPLICATE_POSTGRES_ERROR_CODE = '23505';

    /**
     * Create a new user.
     * @param createUser - The user data to create.
     * @returns The created user.
     */
    async create(createUser: CreateUser) {
        const user = this.userRepository.createOne(createUser).catch((err: any) => {
            if (VERBOSE) console.warn(err);
            if (err instanceof CustomError && err.code === ErrorCodes.DUPLICATE_POSTGRES_ERROR_CODE)
                throw new ConflictException(err.message);
            throw new InternalServerErrorException('#TODO_CODE_001');
        });
        return user;
    }

    /**
     * Returns all users.
     * @returns Array of all users.
     */
    async findAll() {
        return this.userRepository
            .findAll()
            .then((users) => {
                return users; // TODO Serialize
            })
            .catch((err) => {
                if (VERBOSE) console.warn(err);
                throw new InternalServerErrorException('#TODO_CODE_006');
            });
    }

    /**
     * Returns a user by ID.
     * @param id - The ID of the user to find.
     * @returns The user with the given ID.
     * @throws NotFoundException if the user is not found.
     * @throws InternalServerErrorException for other errors.
     */
    async findById(id: number) {
        return await this.userRepository
            .findById(id)
            .then((user) => {
                if (!user) throw new CustomError(ErrorCodes.NOT_FOUND, 'User not found');
                return user; // TODO Serialize
            })
            .catch((err) => {
                if (VERBOSE) console.warn(err);
                if (err instanceof CustomError && err.code === ErrorCodes.NOT_FOUND)
                    throw new NotFoundException(err.message);
                throw new InternalServerErrorException('#TODO_CODE_002');
            });
    }

    // TODO
    async search(params: any) {
        throw new Error('Method not implemented.');
    }

    /**
     * Updates a user by ID.
     * @param id - The ID of the user to update.
     * @param updateUser - The user data to update.
     * @returns The updated user.
     * @throws ConflictException if user with that email already exists.
     * @throws NotFoundException The user is not found.
     * @throws BadRequestException The password is included in the update data.
     * @throws InternalServerErrorException for other errors.
     */
    async update(id: number, updateUser: UpdateUser) {
        return await this.userRepository
            .updateOne(id, updateUser)
            .then((user) => {
                return user; // TODO Serialize
            })
            .catch((err: any) => {
                if (VERBOSE) console.warn(err);
                if (err instanceof CustomError && err.code === ErrorCodes.BAD_METHOD)
                    throw new BadRequestException(err.message);
                if (err instanceof CustomError && err.code === ErrorCodes.DUPLICATE_POSTGRES_ERROR_CODE)
                    throw new ConflictException(err.message);
                if (err instanceof CustomError && err.code === ErrorCodes.NOT_FOUND)
                    throw new NotFoundException(err.message);
                throw new InternalServerErrorException('#TODO_CODE_003');
            });
    }

    /**
     * Updates a user's password by ID.
     * @param id - The ID of the user to update.
     * @param updatePassword - The new password data.
     * @returns The result of the update operation.
     * @throws BadRequestException if the passwords do not match.
     * @throws InternalServerErrorException for other errors.
     */
    async updatePassword(id: number, updatePassword: ChangePasswordDto) {
        if (updatePassword.password !== updatePassword.confirmPassword)
            throw new BadRequestException('Passwords do not match');
        await this.userRepository.updatePassword(id, updatePassword.password).catch((err: any) => {
            if (VERBOSE) console.warn(err);
            if (err instanceof CustomError && err.code === ErrorCodes.NOT_FOUND)
                throw new NotFoundException(err.message);
            throw new InternalServerErrorException('#TODO_CODE_004');
        });
        return true;
    }

    /**
     * Deletes a user by ID.
     * @param id - The ID of the user to delete.
     * @returns True if the user was deleted.
     * @throws BadRequestException if the user is not found.
     * @throws InternalServerErrorException for other errors.
     */
    async remove(id: number) {
        const result = await this.userRepository.deleteOne(id).catch((err: any) => {
            if (VERBOSE) console.warn(err);
            if (err instanceof CustomError && err.code === ErrorCodes.NOT_FOUND)
                throw new NotFoundException(err.message);
            throw new InternalServerErrorException('#TODO_CODE_005');
        });
        return true;
    }
}
