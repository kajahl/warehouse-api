import { Test, TestingModule } from '@nestjs/testing';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'src/models/types/Jwt';

describe('JwtRefreshStrategy', () => {
    let strategy: JwtRefreshStrategy;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtRefreshStrategy,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('TEST_SECRET'),
                    },
                },
            ],
        }).compile();

        strategy = module.get<JwtRefreshStrategy>(JwtRefreshStrategy);
    });

    it('should be defined', () => {
        expect(strategy).toBeDefined();
    });

    describe('validate', () => {
        it('should return payload with refreshToken', async () => {
            const req = {
                get: jest.fn().mockReturnValue('Bearer test-refresh-token'),
            };

            const payload : JwtPayload = { sub: 1, email: 'test@user.com' };
            const result = await strategy.validate(req as any, payload);

            expect(req.get).toHaveBeenCalledWith('authorization');
            expect(result).toEqual(expect.objectContaining(
                {
                    ...payload,
                    refreshToken: 'test-refresh-token',
                }
            ));
        });
    });
});
