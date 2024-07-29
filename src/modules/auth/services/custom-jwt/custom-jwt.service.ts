import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { User } from 'src/models/types/User';

@Injectable()
export class CustomJwtService {
    constructor(
        private readonly jwtService: NestJwtService,
        private readonly configService: ConfigService,
    ) {}

    async generateTokens(user: Omit<User, 'password'>): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        const payload = { sub: user.id, email: user.email };

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '1d',
            secret: this.configService.get<string>('JWT_SECRET'),
        });

        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: '7d',
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        });

        return {
            accessToken,
            refreshToken,
        };
    }

    async verifyToken(token: string): Promise<any> {
        return this.jwtService.verify(token);
    }

    async decodeToken(token: string): Promise<any> {
        return this.jwtService.decode(token);
    }
}
