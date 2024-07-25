import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { UsersModule } from '../../users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/models/entities/User.entity';
import { RolesService } from '../../services/roles/roles.service';

describe('RolesController', () => {
    let controller: RolesController;

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
            controllers: [RolesController],
            providers: [RolesService],
        }).compile();

        controller = module.get<RolesController>(RolesController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
