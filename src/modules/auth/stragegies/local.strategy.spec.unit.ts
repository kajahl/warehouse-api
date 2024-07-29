import { Test, TestingModule } from '@nestjs/testing';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../services/auth/auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { User } from 'src/models/types/User';
import { UserRole } from 'src/models/types/UserRole';

describe('LocalStrategy', () => {
    let strategy: LocalStrategy;
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LocalStrategy,
                {
                    provide: AuthService,
                    useValue: {
                        validateUser: jest.fn(),
                    },
                },
            ],
        }).compile();

        strategy = module.get<LocalStrategy>(LocalStrategy);
        authService = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(strategy).toBeDefined();
    });

    it('should validate and return a user', async () => {
        const user : Omit<User, 'password'> = {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            profileName: 'johndoe',
            email: 'john@doe.com',
            roles: [UserRole.ADMIN],
            permissions: []
        }
        jest.spyOn(authService, 'validateUser').mockResolvedValue(user);
        expect(await strategy.validate('test@example.com', 'password')).toEqual(user);
    });

    it('should throw UnauthorizedException if user is not valid', async () => {
        jest.spyOn(authService, 'validateUser').mockResolvedValue(null);
        await expect(strategy.validate('test@example.com', 'password')).rejects.toThrow(UnauthorizedException);
    });
});