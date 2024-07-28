import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users/users.controller';
import { RolesController } from './controllers/roles/roles.controller';
import { RolesService } from './services/roles/roles.service';
import { UsersService } from './services/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/models/entities/User.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity]), AuthModule],
    controllers: [UsersController, RolesController],
    providers: [RolesService, UsersService],
    exports: [UsersService, RolesService],
})
export class UsersModule {}
