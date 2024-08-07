import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUser, UpdateUser, User } from '../../types/User';
import { UserEntity } from '../../entities/User.entity';
import { Inject } from '@nestjs/common';
import CustomError, { ErrorCodes } from 'src/utils/errors/Custom.error';
import { PasswordService } from 'src/modules/auth/services/password/password.service';
import { UserExceptionMessages } from 'src/utils/exceptions/messages/User.exceptionMessages';

export class UserRepository extends Repository<User> {
    constructor(
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
        @Inject(PasswordService) private passwordService: PasswordService,
    ) {
        super(userRepository.target, userRepository.manager, userRepository.queryRunner);
    }

    private readonly DUPLICATE_POSTGRES_ERROR_CODE = '23505';

    /**
     * Returns all users.
     * @returns Array of all users.
     */
    public async findAll(): Promise<User[]> {
        return this.find();
    }

    /**
     * Returns a user by ID.
     * @param id - The ID of the user to find.
     * @returns The user with the given ID or null if not found.
     */
    public async findById(id: number): Promise<User | null> {
        return this.findOneBy({ id: id }).catch((e) => null);
    }

    /**
     * Returns a user by email.
     * @param email - The email of the user to find.
     * @returns The user with the given email or null if not found.
     */
        public async findByEmail(email: string): Promise<User | null> {
            return this.findOneBy({ email: email.toLowerCase() }).catch((e) => null);
        }

    /**
     * Create a new user.
     * @param user - The user data to create.
     * @returns The created user.
     * @throws CustomError if the user with that email already exists.
     */
    public async createOne(user: CreateUser): Promise<User> {
        user.password = this.passwordService.hashPassword(user.password);
        user.email = user.email.toLowerCase();
        const newUser = this.create(user);
        return this.save(newUser).catch((err) => {
            if (err.code === this.DUPLICATE_POSTGRES_ERROR_CODE)
                throw new CustomError(ErrorCodes.DUPLICATE_POSTGRES_ERROR_CODE, UserExceptionMessages.USER_WITH_THIS_EMAIL_ALREADY_EXISTS);
            throw err;
        });
    }

    /**
     * Update a user.
     * @param id - The ID of the user to update.
     * @param updateUser - The data to update (except password).
     * @returns User with the updated data.
     * @throws CustomError if the user is not found.
     * @throws CustomError if password is included in the update data.
     * @throws CustomError if the user with that email already exists.
     */
    public async updateOne(id: number, updateUser: UpdateUser): Promise<User> {
        const user = await this.findById(id);
        if (!user) throw new CustomError(ErrorCodes.NOT_FOUND, UserExceptionMessages.USER_NOT_FOUND);
        if (updateUser.email) updateUser.email = updateUser.email.toLowerCase();
        if ('password' in updateUser) // DTO should not allow to update password, but just in case
            throw new CustomError(ErrorCodes.BAD_METHOD, UserExceptionMessages.CANNOT_UPDATE_PASSWORD_USING_THIS_METHOD);
        Object.assign(user, updateUser);
        return this.save(user).catch((err) => {
            if (err.code === this.DUPLICATE_POSTGRES_ERROR_CODE)
                throw new CustomError(ErrorCodes.DUPLICATE_POSTGRES_ERROR_CODE, UserExceptionMessages.USER_WITH_THIS_EMAIL_ALREADY_EXISTS);
            throw err;
        });
    }

    /**
     * Update a user's password.
     * @param id The ID of the user to update.
     * @param newPassword The new password.
     * @returns The updated user
     * @throws CustomError if the user is not found.
     */
    public async updatePassword(id: number, newPassword: string): Promise<User> {
        const user = await this.findById(id);
        if (!user) throw new CustomError(ErrorCodes.NOT_FOUND, UserExceptionMessages.USER_NOT_FOUND);
        user.password = this.passwordService.hashPassword(newPassword);
        return this.save(user);
    }

    /**
     * Delete a user by ID.
     * @param id The ID of the user to delete.
     * @returns true if the user was deleted.
     * @throws CustomError if the user is not found.
     */
    public async deleteOne(id: number): Promise<true> {
        const user = await this.findById(id);
        if (!user) throw new CustomError(ErrorCodes.NOT_FOUND, UserExceptionMessages.USER_NOT_FOUND);
        await this.delete(id);
        return true;
    }
}
