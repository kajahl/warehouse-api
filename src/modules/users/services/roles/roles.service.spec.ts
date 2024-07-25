import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { UsersModule } from '../../users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/models/entities/User.entity';

describe('RolesService', () => {
    let service: RolesService;

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
                UsersModule
            ],
            providers: [RolesService],
        }).compile();

        service = module.get<RolesService>(RolesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
