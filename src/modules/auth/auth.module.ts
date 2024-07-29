import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './services/auth/auth.service';
import { AuthController } from './controllers/auth/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/models/entities/User.entity';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './stragegies/local.strategy';
import { SessionSerializer } from './serializer/Session.serializer';
import { PasswordService } from './services/password/password.service';
import { CustomJwtService } from './services/custom-jwt/custom-jwt.service';
import { JwtStrategy } from './stragegies/jwt.strategy';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([UserEntity]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('SESSION_SECRET'),
                signOptions: { expiresIn: '60s' },
            }),
            inject: [ConfigService],
        }),
        forwardRef(() => UsersModule),
        PassportModule.register({ session: true }),
    ],
    providers: [AuthService, JwtStrategy, LocalStrategy, SessionSerializer, PasswordService, CustomJwtService],
    controllers: [AuthController],
    exports: [AuthService, PasswordService],
})
export class AuthModule {}
