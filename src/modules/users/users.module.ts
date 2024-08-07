import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './controllers/users/users.controller';
import { RolesController } from './controllers/roles/roles.controller';
import { RolesService } from './services/roles/roles.service';
import { UsersService } from './services/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/models/entities/User.entity';
import { AuthModule } from '../auth/auth.module';
import { UserRepository } from 'src/models/repositories/user/User.repository';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity]), forwardRef(() => AuthModule), ConfigModule],
    controllers: [UsersController, RolesController],
    providers: [UserRepository, RolesService, UsersService],
    exports: [UsersService, RolesService, TypeOrmModule, UserRepository],
})
export class UsersModule {}
