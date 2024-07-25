import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { UsersService } from '../../services/users/users.service';
import RegisterUserDto from 'src/models/dtos/users/RegisterUser.dto';
import CreateUserDto from 'src/models/dtos/users/CreateUser.dto';
import UpdateUserDto from 'src/models/dtos/users/UpdateUser.dto';
import ChangePasswordDto from 'src/models/dtos/users/ChangePassword.dto';

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
    async findOne(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.usersService.findById(id);
    }

    @Post()
    async register(
        @Body() body: RegisterUserDto
    ) {
        return this.usersService.create({
            ...body,
            roles: [],
            permissions: []
        });
    }

    @Post('create')
    async create(
        @Body() body: CreateUserDto
    ) {
        return this.usersService.create(body);
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateUserDto
    ) {
        return this.usersService.update(id, body);
    }

    @Patch(':id/password')
    async changePassword(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: ChangePasswordDto
    ) {
        return this.usersService.update(id, body);
    }

    @Delete(':id')
    async remove(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.usersService.remove(id);
    }
}
