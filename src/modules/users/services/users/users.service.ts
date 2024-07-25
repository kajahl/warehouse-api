import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/models/entities/User.entity';
import { CreateUser, UpdateUser } from 'src/models/types/User';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import ChangePasswordDto from 'src/models/dtos/users/ChangePassword.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>
    ) {}

    // Temp - hash will be in authService
    hashPassword(password: string) {
        return bcrypt.hashSync(password, 10);
    }
    // End temp

    async create(createUser: CreateUser) {
        createUser.password = this.hashPassword(createUser.password);
        createUser.email = createUser.email.toLowerCase();
        return this.usersRepository.save(createUser);
    }
    
    async findAll() {
        return this.usersRepository.find(); // TODO Serialize
    }

    async findById(id: number) {
        return this.usersRepository.findOne({ where: { id } }); // TODO Serialize
    }

    // TODO
    async search(params: any) {
        throw new Error('Method not implemented.');
    }

    async update(id: number, updateUser: UpdateUser) {
        return this.usersRepository.update(id, updateUser);
    }

    async updatePassword(id: number, updateUser: ChangePasswordDto) {
        if(updateUser.password !== updateUser.confirmPassword) throw new BadRequestException('Passwords do not match');
        return this.usersRepository.update(id, { password: this.hashPassword(updateUser.password) });
    }

    async remove(id: number) {
        return this.usersRepository.delete(id);
    }
}
