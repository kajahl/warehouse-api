import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../../services/auth/auth.service';
import { CustomJwtService } from '../../services/custom-jwt/custom-jwt.service';
import { UsersService } from 'src/modules/users/services/users/users.service';

describe('AuthController', () => {
    let controller: AuthController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [{
                provide: AuthService,
                useValue: {}
            },
            {
                provide: UsersService,
                useValue: {}
            },
            {
                provide: CustomJwtService,
                useValue: {}
            }],
        }).compile();

        controller = module.get<AuthController>(AuthController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
