import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { UsersService } from '../../services/users/users.service';
import RegisterUserDto from 'src/models/dtos/users/RegisterUser.dto';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ) {}

    @Get()
    async findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    async findOne(id: number) {
        return this.usersService.findOne(id);
    }

    @Post()
    async register(
        @Body() body: RegisterUserDto
    ) {
        return this.usersService.create();
    }

    @Post('create')
    async create(
        @Body() body: RegisterUserDto
    ) {
        return this.usersService.create();
    }

    @Put(':id')
    async update(id: number) {
        return this.usersService.update(id);
    }

    @Delete(':id')
    async remove(id: number) {
        return this.usersService.remove(id);
    }


}
