import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRole } from 'src/models/types/UserRole';
import { permission } from 'process';
import { User } from 'src/models/types/User';
import { UserRepository } from 'src/models/repositories/user/User.repository';
import { PasswordService } from '../password/password.service';
import { resolve } from 'dns';

describe('AuthService', () => {
    let service: AuthService;

    const user: User = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        profileName: 'john_doe',
        email: 'john@doe.com',
        password: 'password',
        roles: [UserRole.USER],
        permissions: [],
    };

    let userRepository: UserRepository;
    let passwordService: PasswordService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserRepository,
                    useValue: {
                        findByEmail: jest.fn().mockImplementation(
                            (email: string) =>
                                new Promise((resolve) => {
                                    if (email === user.email) resolve(user);
                                    return resolve(null);
                                }),
                        ),
                    },
                },
                {
                    provide: PasswordService,
                    useValue: {
                        comparePassword: jest.fn().mockImplementation((password: string, hashedPassword: string) => {
                            return password === hashedPassword;
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);

        userRepository = module.get<UserRepository>(UserRepository);
        passwordService = module.get<PasswordService>(PasswordService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('mockValidation', () => {
        it('should resolve user', async () => {
            expect(userRepository.findByEmail(user.email)).resolves.toEqual(user);
        });

        it('should reject user', async () => {
            expect(userRepository.findByEmail('invalid_email')).resolves.toBeNull();
        });

        it('should return true', async () => {
            expect(passwordService.comparePassword(user.password, user.password)).toBe(true);
        });

        it('should return false', async () => {
            expect(passwordService.comparePassword(user.password, 'invalid_password')).toBe(false);
        });
    });

    describe('validateUser()', () => {
        it('should return user if email and password are correct #1', async () => {
            const result = await service.validateUser(user.email, user.password);
            const { password: _, ...userWithoutPassword } = user;
            expect(result).toEqual(expect.objectContaining(userWithoutPassword));
        });

        it('should return user if email and password are correct #2', async () => {
            const result = await service.validateUser(user.email.toUpperCase(), user.password);
            const { password, ...userWithoutPassword } = user;
            expect(result).toEqual(userWithoutPassword);
        });

        it('should return null if email is incorrect', async () => {
            const result = await service.validateUser('invalid_email', user.password);
            expect(result).toBeNull();
        });

        it('should return null if password is incorrect', async () => {
            const result = await service.validateUser(user.email, 'invalid_password');
            expect(result).toBeNull();
        });
    });

    describe('login()', () => {
        it('should return user without password', async () => {
            const { password, ...userWithoutPassword } = user;
            const result = await service.login(userWithoutPassword);
            expect(result).toEqual(userWithoutPassword);
        });
    });
});
