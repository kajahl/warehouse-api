import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/models/entities/User.entity';
import { CreateUser, UpdateUser } from 'src/models/types/User';
import { DeleteResult, QueryFailedError, Repository, UpdateResult } from 'typeorm';
import * as bcrypt from 'bcrypt';
import ChangePasswordDto from 'src/models/dtos/users/ChangePassword.dto';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>) {}

    readonly verbose = false; // TODO: Where to store this?

    // Temp - hash will be in authService
    hashPassword(password: string) {
        return bcrypt.hashSync(password, 10);
    }
    comparePassword(password: string, hash: string) {
        return bcrypt.compareSync(password, hash);
    }
    // End temp

    /**
     * Create a new user.
     * @param createUser - The user data to create.
     * @returns The created user.
     */
    async create(createUser: CreateUser) {
        createUser.password = this.hashPassword(createUser.password);
        createUser.email = createUser.email.toLowerCase();
        const user = this.usersRepository.create(createUser);
        return this.usersRepository.save(user).catch((err: any) => {
            if (this.verbose) console.warn(err);
            if (err.code === '23505') throw new ConflictException('User with this email already exists');
            throw new InternalServerErrorException('#TODO_CODE_001');
        });
        return user;
    }

    /**
     * Returns all users.
     * @returns Array of all users.
     */
    async findAll() {
        return this.usersRepository.find().catch((err) => {
            if (this.verbose) console.warn(err);
            throw new InternalServerErrorException('#TODO_CODE_006');
        }); // TODO Serialize
    }

    /**
     * Returns a user by ID.
     * @param id - The ID of the user to find.
     * @returns The user with the given ID.
     * @throws BadRequestException if the user is not found.
     * @throws InternalServerErrorException for other errors.
     */
    async findById(id: number) {
        const user = await this.usersRepository
            .findOne({ where: { id } })
            .then((u) => {
                return u;
            })
            .catch((err) => {
                if (this.verbose) console.warn(err);
                throw new InternalServerErrorException('#TODO_CODE_002');
            }); // TODO Serialize
        if (user === null) throw new NotFoundException('User not found');
        return user;
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
     * @throws BadRequestException if:
     * - (1) The user is not found.
     * - (2) The email already exists.
     * - (3) The password is included in the update data.
     * @throws InternalServerErrorException for other errors.
     */
    async update(id: number, updateUser: UpdateUser) {
        if (updateUser.email) updateUser.email = updateUser.email.toLowerCase();
        if (updateUser.password)
            throw new BadRequestException('Use the change password endpoint to update the password');
        const result = await this.usersRepository.update(id, updateUser).catch((err: any) => {
            if (this.verbose) console.warn(err);
            if (err.code === '23505') throw new ConflictException('User with this email already exists');
            throw new InternalServerErrorException('#TODO_CODE_003');
        });
        if (result.affected === 0) throw new NotFoundException('User not found');
        return this.findById(id);
    }

    /**
     * Updates a user's password by ID.
     * @param id - The ID of the user to update.
     * @param updatePassword - The new password data.
     * @returns The result of the update operation.
     * @throws BadRequestException if the passwords do not match.
     */
    async updatePassword(id: number, updatePassword: ChangePasswordDto) {
        if (updatePassword.password !== updatePassword.confirmPassword)
            throw new BadRequestException('Passwords do not match');
        const result = await this.usersRepository
            .update(id, { password: this.hashPassword(updatePassword.password) })
            .catch((err: any) => {
                if (this.verbose) console.warn(err);
                throw new InternalServerErrorException('#TODO_CODE_004');
            });
        if (result.affected === 0) throw new NotFoundException('User not found');
        return true;
    }

    /**
     * Deletes a user by ID.
     * @param id - The ID of the user to delete.
     * @returns True if the user was deleted.
     * @throws BadRequestException if the user is not found.
     */
    async remove(id: number) {
        const result = await this.usersRepository.delete(id).catch((err: any) => {
            if (this.verbose) console.warn(err);
            throw new InternalServerErrorException('#TODO_CODE_005');
        });
        if (result.affected === 0) throw new NotFoundException('User not found');
        return true;
    }
}
