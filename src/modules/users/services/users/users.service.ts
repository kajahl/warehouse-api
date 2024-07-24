import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
    constructor() {}

    async create() {
        return 'This action adds a new user';
    }

    async findAll() {
        return 'This action returns all users';
    }

    async findOne(id: number) {
        return `This action returns a #${id} user`;
    }

    async update(id: number) {
        return `This action updates a #${id} user`;
    }

    async remove(id: number) {
        return `This action removes a #${id} user`;
    }
}
