import { Module } from '@nestjs/common';
import { AuthService } from './services/auth/auth.service';
import { AuthController } from './controllers/auth/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/models/entities/User.entity';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}
