import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getDataSourceToken, getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/models/entities/User.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateUser } from 'src/models/types/User';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
    let service: UsersService;
    let dataSource: DataSource;
    let userRepository: Repository<UserEntity>;

    const firstUser: CreateUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'UPPERCASE@test.com',
        password: 'password',
        profileName: 'john_doe',
        roles: [],
        permissions: [],
    }
    const secondUser: CreateUser = {
        firstName: 'Ann',
        lastName: 'Doe',
        email: 'lowercase@TEST.com',
        password: 'password',
        profileName: 'ann_doe',
        roles: [],
        permissions: [],
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: 'postgres',
                    username: 'postgres',
                    password: 'admin',
                    database: 'warehouse_api_test',
                    entities: [UserEntity],
                    synchronize: true,
                }),
                TypeOrmModule.forFeature([UserEntity]),
            ],
            providers: [UsersService],
        }).compile();

        service = module.get<UsersService>(UsersService);
        dataSource = module.get<DataSource>(getDataSourceToken());
        userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    });

    beforeEach(async () => {
        await dataSource.synchronize(true); // Reset database before each test
    });

    afterEach(async () => {
        await dataSource.synchronize(true); // Clean database after each test
    });

    afterAll(async () => {
        await dataSource.destroy(); // Close the connection after all tests are done
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create()', () => {
        it('should create a user', async () => {
            const user = await service.create(firstUser);
            expect(user).toBeDefined();
            expect(user.id).toBeDefined();
            expect(user.email).toBe(firstUser.email.toLowerCase());
        });

        it('should throw an error if the email is already taken', async () => {
            await service.create(firstUser);
            await expect(service.create(firstUser)).rejects.toThrow(ConflictException);
        });
    });

    describe('findAll()', () => {
        beforeEach(async () => {
            await service.create(firstUser);
            await service.create(secondUser);
        });

        it('should return an array of users', async () => {
            const users = await service.findAll();
            expect(users).toBeInstanceOf(Array);
            expect(users.length).toBe(2);
            expect(users.find(user => user.email === firstUser.email.toLowerCase())).toBeDefined();
            expect(users.find(user => user.email === secondUser.email.toLowerCase())).toBeDefined();
        });
    });
    
    describe('findById()', () => {
        let userId: number;

        beforeEach(async () => {
            const user = await service.create(firstUser);
            userId = user.id;
        });

        it('should return a user by id', async () => {
            const user = await service.findById(userId);
            expect(user).toBeDefined();
            expect(user.email).toBe(firstUser.email.toLowerCase());
        });

        it('should return undefined if user is not found', async () => {
            await expect(service.findById(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update()', () => {
        let userId: number;

        beforeEach(async () => {
            const user = await service.create(firstUser);
            userId = user.id;
        });

        it('should update a user', async () => {
            const updatedUser = await service.update(userId, { firstName: 'Jane' });
            expect(updatedUser).toBeDefined();
            expect(updatedUser.firstName).toBe('Jane');
        });

        it('should throw an error if the email is already taken', async () => {
            await service.create(secondUser);
            await expect(service.update(userId, { email: secondUser.email })).rejects.toThrow(ConflictException);
        });

        it('should throw an error if the user is not found', async () => {
            await expect(service.update(999, { firstName: 'Jane' })).rejects.toThrow(NotFoundException);
        });

        it('should throw an error if updating password', async () => {
            await expect(service.update(userId, { password: 'password' })).rejects.toThrow(BadRequestException);
        });
    });

    describe('updatePassword()', () => {
        let userId: number;

        beforeEach(async () => {
            const user = await service.create(firstUser);
            userId = user.id;
        });

        it('should update a user password', async () => {
            const newPassword = 'new_password';
            const updatedUser = await service.updatePassword(userId, {
                password: newPassword,
                confirmPassword: newPassword,
            });
            expect(updatedUser).toBe(true);
            const user = await userRepository.findOne({ where: { id: userId } });
            expect(user.password).not.toEqual(newPassword);
            expect(service.comparePassword(newPassword, user.password)).toBe(true);
        });

        it('should throw an error if the passwords do not match', async () => {
            await expect(service.updatePassword(userId, { password: 'password', confirmPassword: 'wrong' })).rejects.toThrow(BadRequestException);
        });

        it('should throw an error if the user is not found', async () => {
            await expect(service.updatePassword(999, { password: 'password', confirmPassword: 'password' })).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove()', () => {
        let userId: number;

        beforeEach(async () => {
            const user = await service.create(firstUser);
            userId = user.id;
        });

        it('should remove a user', async () => {
            const result = await service.remove(userId);
            expect(result).toBe(true);
            const user = await userRepository.findOne({ where: { id: userId } });
            expect(user).toBeNull();
        });

        it('should throw an error if the user is not found', async () => {
            await expect(service.remove(999)).rejects.toThrow(NotFoundException);
        });
    });

    
});
