import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersModule } from '../../users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/models/entities/User.entity';
import { UsersService } from '../../services/users/users.service';

describe('UsersController', () => {
    let controller: UsersController;

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
                UsersModule,
            ],
            controllers: [UsersController],
            providers: [UsersService],
        }).compile();

        controller = module.get<UsersController>(UsersController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
