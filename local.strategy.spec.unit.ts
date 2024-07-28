// import { Test, TestingModule } from '@nestjs/testing';
// import { LocalStrategy } from './local.strategy';
// import { AuthService } from '../services/auth/auth.service';
// import { UnauthorizedException } from '@nestjs/common';

// describe('LocalStrategy', () => {
//     let strategy: LocalStrategy;
//     let authService: AuthService;

//     beforeEach(async () => {
//         const module: TestingModule = await Test.createTestingModule({
//             providers: [
//                 LocalStrategy,
//                 {
//                     provide: AuthService,
//                     useValue: {
//                         validateUser: jest.fn(),
//                     },
//                 },
//             ],
//         }).compile();

//         strategy = module.get<LocalStrategy>(LocalStrategy);
//         authService = module.get<AuthService>(AuthService);
//     });

//     it('should be defined', () => {
//         expect(strategy).toBeDefined();
//     });

//     it('should validate and return a user', async () => {
//         const user = { id: 1, email: 'test@example.com' };
//         jest.spyOn(authService, 'validateUser').mockResolvedValue(user);

//         expect(await strategy.validate('test@example.com', 'password')).toEqual(user);
//     });

//     it('should throw UnauthorizedException if user is not valid', async () => {
//         jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

//         await expect(strategy.validate('test@example.com', 'password')).rejects.toThrow(UnauthorizedException);
//     });
// });